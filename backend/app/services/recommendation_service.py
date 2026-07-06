from collections import defaultdict

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session, joinedload

from app.models.content import Content, ContentAvailability, ContentGenre
from app.models.rating import Rating
from app.models.watch_history import WatchHistory
from app.schemas.recommendation import RecommendationItem, RecommendationResponse
from app.services.content_service import serialize_content


def get_content_items(db: Session) -> list[Content]:
    return (
        db.query(Content)
        .options(
            joinedload(Content.genres).joinedload(ContentGenre.genre),
            joinedload(Content.availability).joinedload(ContentAvailability.service),
        )
        .all()
    )


def build_content_document(content: Content) -> str:
    genre_names = [item.genre.name for item in content.genres]
    service_names = [item.service.name for item in content.availability]

    values = [
        content.title or "",
        content.description or "",
        content.content_type or "",
        str(content.release_year or ""),
        content.maturity_rating or "",
        "original" if content.is_original else "",
        " ".join(genre_names),
        " ".join(service_names),
    ]

    return " ".join(values)


def build_similarity_dataframe(content_items: list[Content]) -> pd.DataFrame:
    rows = []

    for item in content_items:
        rows.append(
            {
                "content_id": item.id,
                "document": build_content_document(item),
            }
        )

    return pd.DataFrame(rows)


def calculate_similarity(content_items: list[Content]):
    dataframe = build_similarity_dataframe(content_items)

    if dataframe.empty:
        return dataframe, None

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(dataframe["document"])
    similarity_matrix = cosine_similarity(tfidf_matrix)

    return dataframe, similarity_matrix


def get_similar_titles(
    db: Session,
    content_id: int,
    limit: int = 10,
) -> RecommendationResponse:
    content_items = get_content_items(db)
    content_by_id = {item.id: item for item in content_items}

    if content_id not in content_by_id:
        return RecommendationResponse(items=[])

    dataframe, similarity_matrix = calculate_similarity(content_items)

    if similarity_matrix is None:
        return RecommendationResponse(items=[])

    matching_indexes = dataframe.index[dataframe["content_id"] == content_id].tolist()

    if not matching_indexes:
        return RecommendationResponse(items=[])

    source_index = matching_indexes[0]
    similarity_scores = list(enumerate(similarity_matrix[source_index]))

    ranked_scores = sorted(
        similarity_scores,
        key=lambda item: item[1],
        reverse=True,
    )

    recommendations = []

    for index, score in ranked_scores:
        recommended_content_id = int(dataframe.iloc[index]["content_id"])

        if recommended_content_id == content_id:
            continue

        content = content_by_id[recommended_content_id]

        recommendations.append(
            RecommendationItem(
                content=serialize_content(content),
                score=round(float(score), 4),
                reason=f"Similar to {content_by_id[content_id].title}",
            )
        )

        if len(recommendations) >= limit:
            break

    return RecommendationResponse(items=recommendations)


def get_profile_recommendations(
    db: Session,
    profile_id: int,
    limit: int = 10,
) -> RecommendationResponse:
    content_items = get_content_items(db)
    content_by_id = {item.id: item for item in content_items}

    if not content_items:
        return RecommendationResponse(profile_id=profile_id, items=[])

    dataframe, similarity_matrix = calculate_similarity(content_items)

    if similarity_matrix is None:
        return RecommendationResponse(profile_id=profile_id, items=[])

    content_id_to_index = {
        int(row["content_id"]): index
        for index, row in dataframe.iterrows()
    }

    history_items = (
        db.query(WatchHistory)
        .filter(WatchHistory.profile_id == profile_id)
        .all()
    )

    rating_items = (
        db.query(Rating)
        .filter(Rating.profile_id == profile_id)
        .all()
    )

    seed_weights = defaultdict(float)

    for history in history_items:
        if history.content_id in content_id_to_index:
            seed_weights[history.content_id] += 1.0 if history.completed else 0.7

    for rating in rating_items:
        if rating.content_id in content_id_to_index:
            seed_weights[rating.content_id] += rating.score / 5.0

    if not seed_weights:
        fallback_items = sorted(
            content_items,
            key=lambda item: (item.is_original, item.release_year or 0),
            reverse=True,
        )[:limit]

        return RecommendationResponse(
            profile_id=profile_id,
            items=[
                RecommendationItem(
                    content=serialize_content(item),
                    score=0.0,
                    reason="Popular starting recommendation",
                )
                for item in fallback_items
            ],
        )

    candidate_scores = defaultdict(float)

    for seed_content_id, weight in seed_weights.items():
        seed_index = content_id_to_index[seed_content_id]
        similarity_scores = similarity_matrix[seed_index]

        for candidate_index, similarity_score in enumerate(similarity_scores):
            candidate_content_id = int(dataframe.iloc[candidate_index]["content_id"])

            if candidate_content_id in seed_weights:
                continue

            candidate_scores[candidate_content_id] += float(similarity_score) * weight

    ranked_candidates = sorted(
        candidate_scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    recommendations = []

    strongest_seed_id = max(seed_weights, key=seed_weights.get)
    strongest_seed_title = content_by_id[strongest_seed_id].title

    for candidate_content_id, score in ranked_candidates:
        content = content_by_id[candidate_content_id]

        recommendations.append(
            RecommendationItem(
                content=serialize_content(content),
                score=round(float(score), 4),
                reason=f"Because you watched or rated {strongest_seed_title}",
            )
        )

        if len(recommendations) >= limit:
            break

    return RecommendationResponse(
        profile_id=profile_id,
        items=recommendations,
    )


def get_because_you_watched(
    db: Session,
    profile_id: int,
    content_id: int,
    limit: int = 10,
) -> RecommendationResponse:
    response = get_similar_titles(
        db,
        content_id=content_id,
        limit=limit,
    )

    return RecommendationResponse(
        profile_id=profile_id,
        items=[
            RecommendationItem(
                content=item.content,
                score=item.score,
                reason=f"Because you watched content #{content_id}",
            )
            for item in response.items
        ],
    )
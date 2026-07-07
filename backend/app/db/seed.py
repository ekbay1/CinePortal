from app.db.session import SessionLocal
from app.models.content import (
    Content,
    ContentAvailability,
    ContentGenre,
    Genre,
    StreamingService,
)


def get_or_create_service(db, name: str, logo_url: str | None = None):
    service = db.query(StreamingService).filter(StreamingService.name == name).first()

    if service:
        return service

    service = StreamingService(name=name, logo_url=logo_url)
    db.add(service)
    db.commit()
    db.refresh(service)

    return service


def get_or_create_genre(db, name: str):
    genre = db.query(Genre).filter(Genre.name == name).first()

    if genre:
        return genre

    genre = Genre(name=name)
    db.add(genre)
    db.commit()
    db.refresh(genre)

    return genre


def seed_content():
    db = SessionLocal()

    try:
        if db.query(Content).count() > 0:
            print("Content already seeded.")
            return

        services = {
            "CinePortal": get_or_create_service(db, "CinePortal"),
            "Netflix": get_or_create_service(db, "Netflix"),
            "Disney+": get_or_create_service(db, "Disney+"),
            "Max": get_or_create_service(db, "Max"),
            "Peacock": get_or_create_service(db, "Peacock"),
            "Prime Video": get_or_create_service(db, "Prime Video"),
        }

        genres = {
            "Action": get_or_create_genre(db, "Action"),
            "Comedy": get_or_create_genre(db, "Comedy"),
            "Drama": get_or_create_genre(db, "Drama"),
            "Sci-Fi": get_or_create_genre(db, "Sci-Fi"),
            "Thriller": get_or_create_genre(db, "Thriller"),
            "Family": get_or_create_genre(db, "Family"),
            "Fantasy": get_or_create_genre(db, "Fantasy"),
            "Documentary": get_or_create_genre(db, "Documentary"),
        }

        content_seed_data = [
            {
                "title": "Neon Empire",
                "description": "A detective investigates a conspiracy in a futuristic city controlled by powerful media companies.",
                "content_type": "show",
                "release_year": 2026,
                "maturity_rating": "TV-14",
                "runtime_minutes": 48,
                "is_original": True,
                "genres": ["Sci-Fi", "Thriller", "Drama"],
                "services": ["CinePortal"],
            },
            {
                "title": "Final Quarter",
                "description": "A sports drama about an aging superstar trying to win one final championship.",
                "content_type": "movie",
                "release_year": 2025,
                "maturity_rating": "PG-13",
                "runtime_minutes": 132,
                "is_original": True,
                "genres": ["Drama"],
                "services": ["CinePortal"],
            },
            {
                "title": "Dragon Harbor",
                "description": "A family fantasy adventure about siblings who discover a hidden island full of ancient dragons.",
                "content_type": "movie",
                "release_year": 2024,
                "maturity_rating": "PG",
                "runtime_minutes": 115,
                "is_original": False,
                "genres": ["Family", "Fantasy", "Action"],
                "services": ["Disney+"],
            },
            {
                "title": "The Last Signal",
                "description": "A tense sci-fi thriller following astronauts who receive a mysterious message from deep space.",
                "content_type": "movie",
                "release_year": 2023,
                "maturity_rating": "PG-13",
                "runtime_minutes": 124,
                "is_original": False,
                "genres": ["Sci-Fi", "Thriller"],
                "services": ["Max"],
            },
            {
                "title": "Campus Chaos",
                "description": "A comedy series about college roommates trying to survive school, work, and relationships.",
                "content_type": "show",
                "release_year": 2022,
                "maturity_rating": "TV-14",
                "runtime_minutes": 30,
                "is_original": False,
                "genres": ["Comedy"],
                "services": ["Peacock"],
            },
            {
                "title": "Hidden Kitchens",
                "description": "A documentary series exploring family-owned restaurants and the stories behind their signature dishes.",
                "content_type": "documentary",
                "release_year": 2025,
                "maturity_rating": "TV-PG",
                "runtime_minutes": 42,
                "is_original": True,
                "genres": ["Documentary"],
                "services": ["CinePortal", "Prime Video"],
            },
            {
                "title": "Steel Runner",
                "description": "An action movie about a former soldier racing against time to stop a global cyberattack.",
                "content_type": "movie",
                "release_year": 2021,
                "maturity_rating": "PG-13",
                "runtime_minutes": 118,
                "is_original": False,
                "genres": ["Action", "Thriller"],
                "services": ["Netflix"],
            },
            {
                "title": "Family Weekend",
                "description": "A light comedy about a family reunion that goes completely off the rails.",
                "content_type": "movie",
                "release_year": 2020,
                "maturity_rating": "PG",
                "runtime_minutes": 96,
                "is_original": False,
                "genres": ["Comedy", "Family"],
                "services": ["Prime Video"],
            },
        ]

        for item in content_seed_data:
            content = Content(
                title=item["title"],
                description=item["description"],
                content_type=item["content_type"],
                release_year=item["release_year"],
                maturity_rating=item["maturity_rating"],
                runtime_minutes=item["runtime_minutes"],
                is_original=item["is_original"],
                poster_url=None,
                trailer_url=None,
            )

            db.add(content)
            db.commit()
            db.refresh(content)

            for genre_name in item["genres"]:
                db.add(
                    ContentGenre(
                        content_id=content.id,
                        genre_id=genres[genre_name].id,
                    )
                )

            for service_name in item["services"]:
                db.add(
                    ContentAvailability(
                        content_id=content.id,
                        service_id=services[service_name].id,
                        url=None,
                        requires_addon=service_name != "CinePortal",
                    )
                )

            db.commit()

        print("Seeded content successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_content()
"use client";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function StarRating({
  value,
  onChange,
  disabled = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = star <= value;

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={
              isSelected
                ? "text-2xl text-white disabled:opacity-50"
                : "text-2xl text-neutral-600 hover:text-white disabled:opacity-50"
            }
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
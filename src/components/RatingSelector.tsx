'use client'

import { cn } from '@/lib/utils'

interface RatingSelectorProps {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}

function ratingClass(rating: number) {
  if (rating <= 4) return 'bg-neutral-200 text-neutral-700'
  if (rating <= 7) return 'bg-violet-200 text-violet-800'
  return 'bg-violet-600 text-white'
}

export default function RatingSelector({ value, onChange, disabled }: RatingSelectorProps) {
  return (
    <div className="grid grid-cols-10 gap-1.5" role="radiogroup" aria-label="Tu puntuación">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          disabled={disabled}
          onClick={() => onChange(rating)}
          className={cn(
            'aspect-square rounded-lg text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
            value === rating ? ratingClass(rating) : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
          )}
        >
          {rating}
        </button>
      ))}
    </div>
  )
}

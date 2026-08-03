'use client'

interface RatingSliderProps {
  value: number
  onChange: (rating: number) => void
  onCommit: (rating: number) => void
  disabled?: boolean
}

function sliderColor(value: number) {
  if (value <= 4) return '#A3A3A3'
  if (value <= 7) return '#A78BFA'
  return '#7C3AED'
}

export default function RatingSlider({ value, onChange, onCommit, disabled }: RatingSliderProps) {
  const fill = ((value - 1) / 9) * 100
  const color = sliderColor(value)

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <span className="rounded-full px-3 py-1.5 text-sm font-bold text-white" style={{ backgroundColor: color }}>
          Score: {value} / 10
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={() => onCommit(value)}
        onKeyUp={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') onCommit(value)
        }}
        aria-label="Puntuación de la película"
        className="h-3 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#7C3AED] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#7C3AED] [&::-moz-range-thumb]:shadow-md"
        style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${fill}%, #E5E7EB ${fill}%, #E5E7EB 100%)` }}
      />
      <div className="flex justify-between text-[10px] font-semibold text-neutral-500">
        <span>1 (No me interesa)</span>
        <span>10 (¡Must watch!)</span>
      </div>
    </div>
  )
}

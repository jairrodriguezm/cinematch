'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface RatingSliderProps {
  initialValue: number
  onCommit: (rating: number) => void
  disabled?: boolean
}

export default function RatingSlider({ initialValue, onCommit, disabled }: RatingSliderProps) {
  const [value, setValue] = useState(initialValue)
  const [isDragging, setIsDragging] = useState(false)
  const integerValue = Math.round(value)
  const percentage = ((integerValue - 1) / 9) * 100

  return (
    <div className="flex flex-col gap-3 w-full mt-2">
      {/* Top Rating Badge */}
      <div className="flex justify-center items-center">
        <div className="bg-[#f5c518]/15 backdrop-blur-md border border-[#f5c518]/30 text-white font-semibold text-xs px-4 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,197,24,0.25)]">
          Puntuación: <span className="font-extrabold text-[#f5c518] text-sm">{integerValue}</span> / 10
        </div>
      </div>

      {/* Slider & Progress Bar */}
      <div className="w-full relative py-2 my-0.5">
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={integerValue}
          disabled={disabled}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          aria-label="Puntuación de la película"
          className="w-full h-2 rounded-full appearance-none bg-white/10 outline-none relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Visual progress bar overlay */}
        <div
          className="absolute top-[18px] left-0 h-[8px] rounded-l-full pointer-events-none z-20 transition-all duration-75"
          style={{
            width: `${percentage}%`,
            backgroundColor: '#f5c518',
            boxShadow: '0 0 12px rgba(245, 197, 24, 0.7)'
          }}
        />

        {/* Floating Tooltip */}
        <div
          className="absolute top-[-10px] -translate-x-1/2 text-black font-mono text-[11px] px-2 py-0.5 rounded-md transition-opacity duration-200 pointer-events-none z-30 font-extrabold bg-[#f5c518] shadow-[0_0_12px_rgba(245,197,24,0.8)]"
          style={{
            left: `calc(${percentage}% + ${10 - percentage * 0.2}px)`,
            opacity: isDragging ? 1 : 0.85,
          }}
        >
          {integerValue}
        </div>
      </div>

      {/* Confirm Action Button */}
      <div className="flex justify-center mt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCommit(integerValue)}
          className="bg-white text-black font-extrabold text-sm px-6 py-3 rounded-full w-full max-w-[280px] hover:bg-white/90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_25px_rgba(255,255,255,0.35)]"
        >
          Confirmar Calificación
          <CheckCircle2 className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface RatingSliderProps {
  value: number
  onChange: (rating: number) => void
  onCommit: (rating: number) => void
  disabled?: boolean
}

export default function RatingSlider({ value, onChange, onCommit, disabled }: RatingSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const integerValue = Math.round(value)
  const percentage = ((integerValue - 1) / 9) * 100

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      {/* Top Rating Badge */}
      <div className="flex justify-center items-center">
        <div
          className="text-white font-semibold text-sm px-3.5 py-0.5 my-4 rounded-full flex items-center gap-1.5 shadow-md"
          style={{
            backgroundColor: '#bc96ff',
            borderRadius: '1.5rem',
            boxShadow: 'rgba(188, 150, 255, 0.4) 0px 0px 15px'
          }}
        >
          Puntuación: <span className="font-extrabold">{integerValue}</span> / 10
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
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          aria-label="Puntuación de la película"
          className="w-full h-2 rounded-full appearance-none bg-white/10 outline-none relative z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: '0 0 15px rgba(188, 150, 255, 0.5)' }}
        />

        {/* Visual progress bar overlay */}
        <div
          className="absolute top-[18px] left-0 h-[8px] rounded-l-full pointer-events-none z-20"
          style={{
            width: `${percentage}%`,
            backgroundColor: '#bc96ff',
            boxShadow: '0 0 12px rgba(188, 150, 255, 0.7)'
          }}
        />

        {/* Floating Tooltip */}
        <div
          className="absolute top-[-10px] -translate-x-1/2 text-white font-mono text-[11px] px-2 py-0.5 rounded-md transition-opacity duration-200 pointer-events-none z-30 font-bold"
          style={{
            backgroundColor: '#bc96ff',
            left: `calc(${percentage}% + ${10 - percentage * 0.2}px)`,
            opacity: isDragging ? 1 : 0.85,
            boxShadow: '0 0 12px rgba(188, 150, 255, 0.8)'
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
          className="text-white font-bold text-base px-6 py-3 rounded-full w-full max-w-[280px] hover:opacity-90 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          style={{
            backgroundColor: '#ff4365',
            color: 'white',
            boxShadow: '0 0 25px rgba(255, 67, 101, 0.7)',
          }}
        >
          Confirmar Calificación
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

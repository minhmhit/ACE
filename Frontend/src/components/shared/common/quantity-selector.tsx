import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  value: number
  min?: number
  max?: number
  onChange: (nextValue: number) => void
}

export function QuantitySelector({ value, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 backdrop-blur">
      <button type="button" onClick={decrement} className="text-slate-600">
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-6 text-center text-sm font-medium text-slate-800">{value}</span>
      <button type="button" onClick={increment} className="text-slate-600">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

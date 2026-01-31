import { Settings, Loader2 } from 'lucide-react'
import type { ModelInfo } from '@/lib/api'

interface ModelSelectProps {
  value: string
  onChange: (model: string) => void
  models: ModelInfo[]
  isLoading?: boolean
  disabled?: boolean
}

function formatPrice(price: number): string {
  if (price === 0) return 'Kostenlos'
  if (price < 0.01) return `$${price.toFixed(4)}/M`
  if (price < 1) return `$${price.toFixed(2)}/M`
  return `$${price.toFixed(1)}/M`
}

export function ModelSelect({ value, onChange, models, isLoading, disabled }: ModelSelectProps) {
  const selectedModel = models.find((m) => m.id === value)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Lade Modelle...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Settings className="h-4 w-4 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-transparent border border-gray-200 rounded-md px-2 py-1 text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50 max-w-[220px]"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.isFree ? '✨ ' : ''}{model.name} ({formatPrice(model.promptPrice)})
          </option>
        ))}
      </select>
      {selectedModel?.isFree && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Free
        </span>
      )}
    </div>
  )
}

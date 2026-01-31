import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Flame, Beef, Wheat, Droplets, AlertCircle } from 'lucide-react'
import type { NutritionData } from '@/lib/api'
import { cn } from '@/lib/utils'

interface NutritionCardProps {
  data: NutritionData
}

function MacroItem({
  icon: Icon,
  label,
  value,
  unit,
  color
}: {
  icon: React.ElementType
  label: string
  value: number
  unit: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
      <div className={cn("p-2 rounded-full", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value} {unit}</p>
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: NutritionData['confidence'] }) {
  const styles = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  }

  const labels = {
    high: 'Hohe Genauigkeit',
    medium: 'Mittlere Genauigkeit',
    low: 'Geringe Genauigkeit',
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      styles[confidence]
    )}>
      {labels[confidence]}
    </span>
  )
}

export function NutritionCard({ data }: NutritionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{data.dishName}</CardTitle>
            <CardDescription>{data.servingSize}</CardDescription>
          </div>
          <ConfidenceBadge confidence={data.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MacroItem
            icon={Flame}
            label="Kalorien"
            value={data.calories}
            unit="kcal"
            color="bg-orange-500"
          />
          <MacroItem
            icon={Beef}
            label="Protein"
            value={data.protein}
            unit="g"
            color="bg-red-500"
          />
          <MacroItem
            icon={Wheat}
            label="Kohlenhydrate"
            value={data.carbohydrates}
            unit="g"
            color="bg-amber-500"
          />
          <MacroItem
            icon={Droplets}
            label="Fett"
            value={data.fat}
            unit="g"
            color="bg-blue-500"
          />
        </div>

        {(data.fiber !== undefined || data.sugar !== undefined || data.sodium !== undefined) && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Weitere Nährwerte</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {data.fiber !== undefined && (
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Ballaststoffe</p>
                  <p className="font-medium">{data.fiber} g</p>
                </div>
              )}
              {data.sugar !== undefined && (
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Zucker</p>
                  <p className="font-medium">{data.sugar} g</p>
                </div>
              )}
              {data.sodium !== undefined && (
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Natrium</p>
                  <p className="font-medium">{data.sodium} mg</p>
                </div>
              )}
            </div>
          </div>
        )}

        {data.notes && (
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{data.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

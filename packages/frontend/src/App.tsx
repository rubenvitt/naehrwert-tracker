import { useState, useEffect } from 'react'
import { AnalysisForm } from './components/AnalysisForm'
import { NutritionCard } from './components/NutritionCard'
import { ModelSelect } from './components/ModelSelect'
import { TokenInput } from './components/TokenInput'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { analyzeFood, fetchModels, DEFAULT_MODEL, RateLimitError, type NutritionData, type ModelInfo, type TokenValidation } from './lib/api'
import { AlertCircle, Utensils, Lock } from 'lucide-react'

const STORAGE_KEY = 'naehrwert-tracker-model'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<NutritionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [models, setModels] = useState<ModelInfo[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [model, setModel] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL
  })
  const [auth, setAuth] = useState<TokenValidation>({ valid: false })
  const [authChecked, setAuthChecked] = useState(false)

  // Modelle laden sobald authentifiziert
  useEffect(() => {
    if (!auth.valid) {
      setModels([])
      return
    }

    setModelsLoading(true)
    fetchModels()
      .then((data) => {
        setModels(data)
        const savedModel = localStorage.getItem(STORAGE_KEY)
        if (savedModel && !data.some((m) => m.id === savedModel)) {
          const defaultExists = data.some((m) => m.id === DEFAULT_MODEL)
          setModel(defaultExists ? DEFAULT_MODEL : data[0]?.id || DEFAULT_MODEL)
        }
      })
      .catch(console.error)
      .finally(() => setModelsLoading(false))
  }, [auth.valid])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, model)
  }, [model])

  const handleAuthChange = (newAuth: TokenValidation) => {
    setAuth(newAuth)
    setAuthChecked(true)
    setError(null)
    setResult(null)
  }

  const handleAnalyze = async (
    imageBase64?: string,
    mimeType?: string,
    description?: string
  ) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeFood(imageBase64, mimeType, description, model)
      setResult(data)
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError(`Rate-Limit erreicht. Bitte warte ${err.retryAfter} Sekunden.`)
      } else {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nährwert-Tracker</h1>
          <p className="text-gray-500 mt-1">
            Fotografiere dein Essen und erhalte sofort die Nährwertangaben
          </p>
        </div>

        {/* Token-Eingabe */}
        <Card>
          <CardContent className="pt-6">
            <TokenInput onAuthChange={handleAuthChange} />
          </CardContent>
        </Card>

        {/* Nur anzeigen wenn authentifiziert */}
        {auth.valid ? (
          <>
            <div className="flex justify-center">
              <ModelSelect
                value={model}
                onChange={setModel}
                models={models}
                isLoading={modelsLoading}
                disabled={isLoading}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gericht analysieren</CardTitle>
                <CardDescription>
                  Lade ein Foto hoch oder beschreibe dein Gericht
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalysisForm onSubmit={handleAnalyze} isLoading={isLoading} />
              </CardContent>
            </Card>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3 text-red-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Fehler bei der Analyse</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && <NutritionCard data={result} />}
          </>
        ) : authChecked ? (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3 text-gray-500">
                <Lock className="h-8 w-8" />
                <div>
                  <p className="font-medium text-gray-700">Authentifizierung erforderlich</p>
                  <p className="text-sm mt-1">
                    Bitte gib einen gültigen API-Token ein, um die App zu nutzen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default App

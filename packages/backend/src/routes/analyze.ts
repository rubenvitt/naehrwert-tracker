import { Hono } from 'hono'
import { analyzeFood, type NutritionData } from '../services/gemini'

const app = new Hono()

interface AnalyzeRequest {
  image?: string // base64 encoded, optional
  mimeType?: string
  description?: string
  model?: string
}

interface AnalyzeResponse {
  success: boolean
  data?: NutritionData
  error?: string
}

app.post('/analyze', async (c) => {
  try {
    const body = await c.req.json<AnalyzeRequest>()

    if (!body.image && !body.description) {
      return c.json<AnalyzeResponse>({
        success: false,
        error: 'Bitte gib ein Bild oder eine Beschreibung an',
      }, 400)
    }

    // Remove data URL prefix if present
    const base64Data = body.image?.replace(/^data:image\/\w+;base64,/, '')

    const nutritionData = await analyzeFood({
      imageBase64: base64Data,
      mimeType: body.mimeType,
      description: body.description,
      model: body.model,
    })

    return c.json<AnalyzeResponse>({
      success: true,
      data: nutritionData,
    })
  } catch (error) {
    console.error('Analysis error:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'Ein unbekannter Fehler ist aufgetreten'

    return c.json<AnalyzeResponse>({
      success: false,
      error: errorMessage,
    }, 500)
  }
})

export default app

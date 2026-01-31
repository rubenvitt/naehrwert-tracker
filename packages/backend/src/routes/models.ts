import { Hono } from 'hono'

const app = new Hono()

interface OpenRouterModel {
  id: string
  name: string
  architecture: {
    input_modalities: string[]
  }
  pricing: {
    prompt: string // price per token as string
    completion: string
    image?: string
  }
}

interface ModelsResponse {
  data: OpenRouterModel[]
}

export interface ModelInfo {
  id: string
  name: string
  promptPrice: number // per million tokens
  isFree: boolean
}

app.get('/models', async (c) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }

    const data: ModelsResponse = await response.json()

    // Filter for models that support image input
    const visionModels: ModelInfo[] = data.data
      .filter((model) => model.architecture.input_modalities?.includes('image'))
      .map((model) => {
        const pricePerToken = parseFloat(model.pricing.prompt) || 0
        const pricePerMillion = pricePerToken * 1_000_000
        return {
          id: model.id,
          name: model.name,
          promptPrice: pricePerMillion,
          isFree: pricePerToken === 0,
        }
      })
      // Sort: free models first, then by price
      .sort((a, b) => {
        if (a.isFree && !b.isFree) return -1
        if (!a.isFree && b.isFree) return 1
        return a.promptPrice - b.promptPrice
      })

    return c.json({ success: true, models: visionModels })
  } catch (error) {
    console.error('Models fetch error:', error)
    return c.json({ success: false, error: 'Modelle konnten nicht geladen werden' }, 500)
  }
})

export default app

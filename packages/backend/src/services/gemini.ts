import OpenAI from 'openai'

export interface NutritionData {
  dishName: string
  servingSize: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  confidence: 'high' | 'medium' | 'low'
  notes?: string
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
})

const SYSTEM_PROMPT = `Du bist ein Ernährungsexperte, der Gerichte analysiert und präzise Nährwertangaben schätzt.

Analysiere das Gericht (anhand von Bild und/oder Beschreibung) und gib die Nährwerte im folgenden JSON-Format zurück:

{
  "dishName": "Name des Gerichts auf Deutsch",
  "servingSize": "Geschätzte Portionsgröße (z.B. '1 Portion, ca. 350g')",
  "calories": Kalorien als Zahl,
  "protein": Protein in Gramm als Zahl,
  "carbohydrates": Kohlenhydrate in Gramm als Zahl,
  "fat": Fett in Gramm als Zahl,
  "fiber": Ballaststoffe in Gramm als Zahl (optional),
  "sugar": Zucker in Gramm als Zahl (optional),
  "sodium": Natrium in mg als Zahl (optional),
  "confidence": "high" | "medium" | "low",
  "notes": "Optionale Anmerkungen zur Schätzung"
}

Wichtige Regeln:
- Gib NUR valides JSON zurück, keine zusätzlichen Erklärungen
- Schätze realistisch basierend auf typischen Portionsgrößen
- Setze confidence auf "low" wenn die Informationen unklar sind
- Alle Zahlen sind numerische Werte, keine Strings
- dishName und servingSize immer auf Deutsch`

const DEFAULT_MODEL = 'google/gemini-2.0-flash-001'

export interface AnalyzeInput {
  imageBase64?: string
  mimeType?: string
  description?: string
  model?: string
}

export async function analyzeFood(input: AnalyzeInput): Promise<NutritionData> {
  const { imageBase64, mimeType, description, model } = input

  // Build user message content
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []

  if (imageBase64 && mimeType) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${imageBase64}`,
      },
    })
  }

  let textPrompt: string
  if (imageBase64 && description) {
    textPrompt = `Analysiere dieses Gericht. Zusätzliche Beschreibung: ${description}`
  } else if (imageBase64) {
    textPrompt = 'Analysiere dieses Gericht.'
  } else if (description) {
    textPrompt = `Schätze die Nährwerte für folgendes Gericht: ${description}`
  } else {
    throw new Error('Bitte gib ein Bild oder eine Beschreibung an')
  }

  userContent.push({
    type: 'text',
    text: textPrompt,
  })

  const response = await openai.chat.completions.create({
    model: model || DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
  })

  const text = response.choices[0]?.message?.content || ''

  // Parse JSON from response, handling potential markdown code blocks
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('Konnte keine Nährwertdaten aus der Antwort extrahieren')
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0]

  try {
    const data = JSON.parse(jsonStr) as NutritionData
    return data
  } catch {
    throw new Error('Ungültiges JSON-Format in der Antwort')
  }
}

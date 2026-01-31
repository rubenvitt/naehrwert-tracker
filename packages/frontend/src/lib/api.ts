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

interface AnalyzeResponse {
  success: boolean
  data?: NutritionData
  error?: string
}

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-001'

export interface ModelInfo {
  id: string
  name: string
  promptPrice: number // per million tokens
  isFree: boolean
}

// Token Management
const TOKEN_STORAGE_KEY = 'naehrwert-tracker-token'

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

// Rate Limit Error
export class RateLimitError extends Error {
  retryAfter: number

  constructor(retryAfter: number) {
    super(`Rate limit überschritten. Bitte warte ${retryAfter} Sekunden.`)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

// API Fetch Wrapper
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 429) {
    const data = await response.json()
    throw new RateLimitError(data.retryAfter || 60)
  }

  return response
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

export function parseRateLimitHeaders(response: Response): RateLimitInfo | null {
  const limit = response.headers.get('X-RateLimit-Limit')
  const remaining = response.headers.get('X-RateLimit-Remaining')
  const reset = response.headers.get('X-RateLimit-Reset')

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    }
  }

  return null
}

export async function fetchModels(): Promise<ModelInfo[]> {
  const response = await apiFetch('/api/models')
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Modelle konnten nicht geladen werden')
  }

  return result.models
}

export interface TokenValidation {
  valid: boolean
  username?: string
  rateLimit?: number
}

export async function validateToken(): Promise<TokenValidation> {
  try {
    const response = await apiFetch('/api/auth/validate')
    const data = await response.json()
    return {
      valid: data.valid === true,
      username: data.username,
      rateLimit: data.rateLimit,
    }
  } catch {
    return { valid: false }
  }
}

export async function analyzeFood(
  imageBase64?: string,
  mimeType?: string,
  description?: string,
  model?: string
): Promise<NutritionData> {
  const response = await apiFetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      mimeType,
      description,
      model: model || DEFAULT_MODEL,
    }),
  })

  const result: AnalyzeResponse = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Analyse fehlgeschlagen')
  }

  return result.data
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

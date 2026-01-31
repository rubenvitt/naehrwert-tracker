import { useState, useEffect, useCallback } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { getAuthToken, setAuthToken, clearAuthToken, validateToken, type TokenValidation } from '@/lib/api'
import { Key, Check, X, Loader2 } from 'lucide-react'

interface TokenInputProps {
  onAuthChange?: (auth: TokenValidation) => void
}

export function TokenInput({ onAuthChange }: TokenInputProps) {
  const [token, setToken] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [auth, setAuth] = useState<TokenValidation>({ valid: false })
  const [showError, setShowError] = useState(false)

  const checkStoredToken = useCallback(async () => {
    const stored = getAuthToken()
    if (stored) {
      setToken(stored)
      setIsValidating(true)
      const result = await validateToken()
      setAuth(result)
      onAuthChange?.(result)
      if (!result.valid) {
        clearAuthToken()
        setToken('')
      }
      setIsValidating(false)
    }
  }, [onAuthChange])

  useEffect(() => {
    checkStoredToken()
  }, [checkStoredToken])

  const handleSave = async () => {
    if (!token.trim()) return

    setIsValidating(true)
    setShowError(false)
    setAuthToken(token.trim())

    const result = await validateToken()
    setAuth(result)
    onAuthChange?.(result)

    if (!result.valid) {
      clearAuthToken()
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    }

    setIsValidating(false)
  }

  const handleClear = () => {
    clearAuthToken()
    setToken('')
    setAuth({ valid: false })
    setShowError(false)
    onAuthChange?.({ valid: false })
  }

  if (auth.valid) {
    return (
      <div className="flex items-center justify-between gap-3 p-2 rounded-md bg-green-50 border border-green-200">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          <span className="font-medium">{auth.username}</span>
          <span className="text-green-600 text-xs">({auth.rateLimit} Req/Min)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-7 text-xs text-green-700 hover:text-green-900 hover:bg-green-100"
        >
          Abmelden
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="password"
            placeholder="API-Token eingeben"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
              setShowError(false)
            }}
            className={`pl-8 h-9 text-sm ${showError ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={!token.trim() || isValidating}
          size="sm"
          className="h-9"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Anmelden'
          )}
        </Button>
      </div>
      {showError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="h-3 w-3" />
          Ungültiger Token
        </p>
      )}
    </div>
  )
}

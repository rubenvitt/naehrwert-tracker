import { useState, useCallback } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import heic2any from 'heic2any'
import { ImageUpload } from './ImageUpload'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { fileToBase64 } from '@/lib/api'

async function convertHeicToJpeg(file: File): Promise<File> {
  // Prüfen ob HEIC/HEIF
  const isHeic = file.type === 'image/heic' ||
                 file.type === 'image/heif' ||
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif')

  if (!isHeic) return file

  const blob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  })

  const resultBlob = Array.isArray(blob) ? blob[0] : blob
  return new File([resultBlob], file.name.replace(/\.heic$/i, '.jpg'), {
    type: 'image/jpeg',
  })
}

interface AnalysisFormProps {
  onSubmit: (imageBase64?: string, mimeType?: string, description?: string) => Promise<void>
  isLoading: boolean
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const [isConverting, setIsConverting] = useState(false)

  const handleImageSelect = useCallback(async (file: File) => {
    setIsConverting(true)
    try {
      const convertedFile = await convertHeicToJpeg(file)
      setSelectedFile(convertedFile)
      const url = URL.createObjectURL(convertedFile)
      setPreview(url)
    } catch (err) {
      console.error('Fehler bei Bildkonvertierung:', err)
      // Fallback: Original-Datei verwenden
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    } finally {
      setIsConverting(false)
    }
  }, [])

  const handleImageClear = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setSelectedFile(null)
    setPreview(null)
  }, [preview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile && !description.trim()) return

    if (selectedFile) {
      const base64 = await fileToBase64(selectedFile)
      await onSubmit(base64, selectedFile.type, description || undefined)
    } else {
      await onSubmit(undefined, undefined, description)
    }
  }

  const canSubmit = selectedFile || description.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        onImageSelect={handleImageSelect}
        onImageClear={handleImageClear}
        preview={preview}
        disabled={isLoading || isConverting}
      />
      {isConverting && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Konvertiere HEIC...
        </p>
      )}

      <div className="relative">
        <Input
          type="text"
          placeholder="Beschreibung (z.B. '200g Spaghetti Carbonara')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        {!selectedFile && (
          <p className="text-xs text-gray-400 mt-1">
            Ohne Bild wird anhand der Beschreibung geschätzt
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!canSubmit || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analysiere...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Nährwerte analysieren
          </>
        )}
      </Button>
    </form>
  )
}

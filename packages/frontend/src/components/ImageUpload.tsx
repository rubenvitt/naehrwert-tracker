import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageClear: () => void
  preview: string | null
  disabled?: boolean
}

export function ImageUpload({
  onImageSelect,
  onImageClear,
  preview,
  disabled
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }, [onImageSelect])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }, [onImageSelect])

  if (preview) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Vorschau"
          className="w-full h-64 object-cover rounded-lg"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onImageClear}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging
          ? "border-gray-900 bg-gray-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        {isDragging ? (
          <ImageIcon className="w-12 h-12 mb-3 text-gray-500" />
        ) : (
          <Upload className="w-12 h-12 mb-3 text-gray-400" />
        )}
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Klicken zum Hochladen</span> oder Bild hierher ziehen
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP oder HEIC</p>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </label>
  )
}

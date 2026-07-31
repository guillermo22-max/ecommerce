import { useRef, useState } from 'react'
import { ApiError } from '../../api/client'
import { uploadImage } from '../../api/uploads'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function ImageUploader({ images, onAdd, onRemove }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [removingIndex, setRemovingIndex] = useState(null)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no soportado (usa JPG, PNG, WEBP o GIF).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const { url } = await uploadImage(file)
      await onAdd({ url, alt_text: '', position: images.length })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(image, index) {
    setRemovingIndex(index)
    setError('')
    try {
      await onRemove(image, index)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo quitar la imagen.')
    } finally {
      setRemovingIndex(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">Imágenes</span>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={image.id ?? image.url}
            className="group relative h-24 w-24 overflow-hidden rounded-md border border-slate-200 bg-slate-100"
          >
            <img src={image.url} alt={image.alt_text ?? ''} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(image, index)}
              disabled={removingIndex === index}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
              aria-label="Quitar imagen"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700 disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : '+ Subir imagen'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

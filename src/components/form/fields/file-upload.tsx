'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Upload, X, File, Image, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadFieldProps {
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
  value: unknown
  onChange: (value: File | File[] | null) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
  if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

export function FileUploadField({
  accept,
  maxSizeMB = 10,
  multiple = false,
  value,
  onChange,
}: FileUploadFieldProps) {
  const [error, setError] = useState<string | null>(null)

  const files = value
    ? Array.isArray(value)
      ? value
      : [value]
    : []

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        setError('Some files were rejected. Please check file type and size.')
        return
      }

      // Check file sizes
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > maxSizeMB * 1024 * 1024
      )
      if (oversizedFiles.length > 0) {
        setError(`Files must be smaller than ${maxSizeMB}MB`)
        return
      }

      if (multiple) {
        onChange(acceptedFiles)
      } else {
        onChange(acceptedFiles[0] || null)
      }
    },
    [onChange, multiple, maxSizeMB]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept
      ? accept.split(',').reduce((acc, type) => {
          const trimmed = type.trim()
          if (trimmed.startsWith('.')) {
            // File extension
            acc[`application/${trimmed.slice(1)}`] = [trimmed]
          } else {
            // MIME type
            acc[trimmed] = []
          }
          return acc
        }, {} as Record<string, string[]>)
      : undefined,
    multiple,
    maxSize: maxSizeMB * 1024 * 1024,
  })

  const removeFile = (index: number) => {
    if (multiple) {
      const newFiles = [...files]
      newFiles.splice(index, 1)
      onChange(newFiles.length > 0 ? newFiles : null)
    } else {
      onChange(null)
    }
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-pink-500 bg-pink-50'
            : 'border-muted-foreground/25 hover:border-pink-300 hover:bg-pink-50/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-pink-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept && `Accepted: ${accept}`}
              {accept && ' • '}
              Max size: {maxSizeMB}MB
              {multiple && ' • Multiple files allowed'}
            </p>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file: File, index: number) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

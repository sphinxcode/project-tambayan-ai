'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExpectedOutput } from '@/types'
import { CheckCircle2, XCircle, Download, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ResultCardProps {
  success: boolean
  data: unknown
  creditsUsed?: number
  error?: string
  expectedOutput?: ExpectedOutput
}

function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function isBase64(str: string): boolean {
  const base64Regex = /^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/
  return base64Regex.test(str)
}

export function ResultCard({
  success,
  data,
  creditsUsed,
  error,
  expectedOutput,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = expectedOutput?.downloadFileName || 'result.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Render result based on type
  const renderResult = () => {
    if (!data) return null

    // If data is a string
    if (typeof data === 'string') {
      // Check if it's a URL
      if (isUrl(data)) {
        // Check output type for images/documents
        if (expectedOutput?.type === 'image' || data.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return (
            <div className="space-y-2">
              <img
                src={data}
                alt="Result"
                className="max-w-full rounded-lg border"
              />
              <Button variant="outline" size="sm" asChild>
                <a href={data} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in new tab
                </a>
              </Button>
            </div>
          )
        }

        if (expectedOutput?.type === 'document' || data.match(/\.(pdf|doc|docx)$/i)) {
          return (
            <Button variant="outline" asChild>
              <a href={data} download>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </a>
            </Button>
          )
        }

        // Generic URL
        return (
          <a
            href={data}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:underline flex items-center gap-1"
          >
            {data}
            <ExternalLink className="h-4 w-4" />
          </a>
        )
      }

      // Check if it's base64 image
      if (isBase64(data)) {
        return (
          <img
            src={data}
            alt="Result"
            className="max-w-full rounded-lg border"
          />
        )
      }

      // Plain text - check if it looks like JSON
      try {
        const parsed = JSON.parse(data)
        return (
          <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-96 text-sm">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        )
      } catch {
        // Not JSON, render as text
        return (
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
            {data}
          </div>
        )
      }
    }

    // If data is an object
    if (typeof data === 'object') {
      return (
        <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-96 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )
    }

    // Fallback
    return <span>{String(data)}</span>
  }

  if (!success) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Execution Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error || 'An unknown error occurred'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Execution Successful
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
        {creditsUsed !== undefined && (
          <p className="text-sm text-muted-foreground">
            Used {creditsUsed} credit{creditsUsed !== 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>
      <CardContent>{renderResult()}</CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tool, FormConfig, FormField as FormFieldType } from '@/types'
import { executeTool } from '@/lib/api/tools'
import { useCreditStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormFieldRenderer } from './form-field-renderer'
import { ResultCard } from './results/result-card'
import { Loader2 } from 'lucide-react'

interface FormInterfaceProps {
  tool: Tool
  config: FormConfig | null
}

// Generate Zod schema from form fields
function generateSchema(fields: FormFieldType[]) {
  const schemaMap: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case 'email':
        schema = z.string().email(field.validation?.customMessage || 'Invalid email')
        break
      case 'url':
        schema = z.string().url(field.validation?.customMessage || 'Invalid URL')
        break
      case 'number':
        schema = z.coerce.number()
        if (field.validation?.min !== undefined) {
          schema = (schema as z.ZodNumber).min(field.validation.min)
        }
        if (field.validation?.max !== undefined) {
          schema = (schema as z.ZodNumber).max(field.validation.max)
        }
        break
      case 'checkbox':
        schema = z.boolean()
        break
      case 'multi-select':
        schema = z.array(z.string())
        break
      case 'file':
        schema = z.any()
        break
      default:
        schema = z.string()
        if (field.validation?.minLength) {
          schema = (schema as z.ZodString).min(
            field.validation.minLength,
            field.validation.customMessage || `Minimum ${field.validation.minLength} characters`
          )
        }
        if (field.validation?.maxLength) {
          schema = (schema as z.ZodString).max(
            field.validation.maxLength,
            field.validation.customMessage || `Maximum ${field.validation.maxLength} characters`
          )
        }
        if (field.validation?.pattern) {
          schema = (schema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            field.validation.customMessage || 'Invalid format'
          )
        }
    }

    // Handle required/optional
    if (!field.required) {
      schema = schema.optional()
    }

    schemaMap[field.payloadKey] = schema
  })

  return z.object(schemaMap)
}

// Default form config when none provided
const defaultConfig: FormConfig = {
  fields: [],
  submitButton: {
    text: 'Run Tool',
    loadingText: 'Processing...',
  },
  responseHandling: {
    type: 'display',
  },
}

export function FormInterface({ tool, config }: FormInterfaceProps) {
  const formConfig = config || defaultConfig
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    data: unknown
    creditsUsed?: number
    error?: string
  } | null>(null)

  const { hasEnoughCredits, deductCredits } = useCreditStore()

  // Generate schema and default values
  const schema = generateSchema(formConfig.fields)
  const defaultValues: Record<string, unknown> = {}
  formConfig.fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      defaultValues[field.payloadKey] = field.defaultValue
    } else if (field.type === 'checkbox') {
      defaultValues[field.payloadKey] = false
    } else if (field.type === 'multi-select') {
      defaultValues[field.payloadKey] = []
    } else {
      defaultValues[field.payloadKey] = ''
    }
  })

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!hasEnoughCredits(tool.creditCost)) {
      setResult({
        success: false,
        data: null,
        error: 'Insufficient credits. Please purchase more credits to continue.',
      })
      return
    }

    setIsExecuting(true)
    setResult(null)

    try {
      const response = await executeTool(tool.id, { inputs: data })

      if (response.success) {
        deductCredits(response.creditsUsed)
        setResult({
          success: true,
          data: response.result,
          creditsUsed: response.creditsUsed,
        })
      } else {
        setResult({
          success: false,
          data: null,
          error: 'Tool execution failed. Please try again.',
        })
      }
    } catch (err) {
      setResult({
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // If no fields, show a message
  if (formConfig.fields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          This tool doesn&apos;t have a form configuration yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {formConfig.fields.map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              form={form}
            />
          ))}

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              This will use <span className="font-medium">{tool.creditCost} credits</span>
            </p>
            <Button type="submit" disabled={isExecuting} className="bg-pink-500 hover:bg-pink-600">
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {formConfig.submitButton.loadingText}
                </>
              ) : (
                formConfig.submitButton.text
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Results */}
      {result && (
        <ResultCard
          success={result.success}
          data={result.data}
          creditsUsed={result.creditsUsed}
          error={result.error}
          expectedOutput={formConfig.expectedOutput}
        />
      )}
    </div>
  )
}

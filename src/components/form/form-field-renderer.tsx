'use client'

import { FormField as FormFieldType } from '@/types'
import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileUploadField } from './fields/file-upload'
import { MultiSelectField } from './fields/multi-select'
import { RichTextField } from './fields/rich-text'

interface FormFieldRendererProps {
  field: FormFieldType
  form: UseFormReturn<Record<string, unknown>>
}

export function FormFieldRenderer({ field, form }: FormFieldRendererProps) {
  // Hidden fields
  if (field.type === 'hidden') {
    return (
      <input
        type="hidden"
        {...form.register(field.payloadKey)}
        value={String(field.defaultValue || '')}
      />
    )
  }

  // HTML content (display only)
  if (field.type === 'html') {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: field.htmlContent || '' }}
      />
    )
  }

  return (
    <FormField
      control={form.control}
      name={field.payloadKey}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>

          {/* Text-based inputs */}
          {['text', 'email', 'url', 'tel', 'password'].includes(field.type) && (
            <FormControl>
              <Input
                type={field.type}
                placeholder={field.placeholder}
                {...formField}
                value={(formField.value as string) || ''}
              />
            </FormControl>
          )}

          {/* Number input */}
          {field.type === 'number' && (
            <FormControl>
              <Input
                type="number"
                placeholder={field.placeholder}
                min={field.validation?.min}
                max={field.validation?.max}
                {...formField}
                value={(formField.value as number) || ''}
                onChange={(e) => formField.onChange(e.target.valueAsNumber || '')}
              />
            </FormControl>
          )}

          {/* Date/Time inputs */}
          {['date', 'time', 'datetime-local'].includes(field.type) && (
            <FormControl>
              <Input
                type={field.type}
                {...formField}
                value={(formField.value as string) || ''}
              />
            </FormControl>
          )}

          {/* Textarea */}
          {field.type === 'textarea' && (
            <FormControl>
              <Textarea
                placeholder={field.placeholder}
                className="min-h-[100px] resize-y"
                {...formField}
                value={(formField.value as string) || ''}
              />
            </FormControl>
          )}

          {/* Select */}
          {field.type === 'select' && (
            <Select
              onValueChange={formField.onChange}
              value={(formField.value as string) || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Multi-select */}
          {field.type === 'multi-select' && (
            <FormControl>
              <MultiSelectField
                options={field.options || []}
                value={formField.value}
                onChange={formField.onChange}
                placeholder={field.placeholder}
              />
            </FormControl>
          )}

          {/* Checkbox */}
          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={formField.value as boolean}
                  onCheckedChange={formField.onChange}
                />
              </FormControl>
              {field.description && (
                <Label className="text-sm font-normal text-muted-foreground">
                  {field.description}
                </Label>
              )}
            </div>
          )}

          {/* Radio group */}
          {field.type === 'radio' && (
            <FormControl>
              <RadioGroup
                onValueChange={formField.onChange}
                value={(formField.value as string) || ''}
                className="space-y-2"
              >
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`${field.id}-${option.value}`}
                      disabled={option.disabled}
                    />
                    <Label
                      htmlFor={`${field.id}-${option.value}`}
                      className="font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* File upload */}
          {field.type === 'file' && (
            <FormControl>
              <FileUploadField
                accept={field.accept}
                maxSizeMB={field.maxSizeMB}
                multiple={field.multiple}
                value={formField.value}
                onChange={formField.onChange}
              />
            </FormControl>
          )}

          {/* Rich text */}
          {field.type === 'rich-text' && (
            <FormControl>
              <RichTextField
                value={(formField.value as string) || ''}
                onChange={formField.onChange}
                options={field.richTextOptions}
              />
            </FormControl>
          )}

          {/* Description (for non-checkbox fields) */}
          {field.description && field.type !== 'checkbox' && (
            <FormDescription>{field.description}</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  )
}

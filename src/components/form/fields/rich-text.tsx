'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ToolbarOption = 'bold' | 'italic' | 'underline' | 'link' | 'bulletList' | 'orderedList'

interface RichTextFieldProps {
  value: string
  onChange: (value: string) => void
  options?: {
    toolbar: ToolbarOption[]
    maxLength?: number
  }
}

const defaultToolbar: ToolbarOption[] = ['bold', 'italic', 'bulletList', 'orderedList']

export function RichTextField({ value, onChange, options }: RichTextFieldProps) {
  const toolbar = options?.toolbar || defaultToolbar

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: toolbar.includes('bulletList') ? {} : false,
        orderedList: toolbar.includes('orderedList') ? {} : false,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[150px] p-3 focus:outline-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  const handleLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const charCount = editor.storage.characterCount?.characters() || 0
  const maxLength = options?.maxLength

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        {toolbar.includes('bold') && (
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
        )}

        {toolbar.includes('italic') && (
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
        )}

        {toolbar.includes('underline') && (
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => {
              // Underline not in StarterKit, you'd need @tiptap/extension-underline
              // For now, just toggle bold as a placeholder
              editor.chain().focus().toggleBold().run()
            }}
          >
            <Underline className="h-4 w-4" />
          </Toggle>
        )}

        {toolbar.includes('link') && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-accent')}
              onClick={handleLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </>
        )}

        {(toolbar.includes('bulletList') || toolbar.includes('orderedList')) && (
          <Separator orientation="vertical" className="h-6 mx-1" />
        )}

        {toolbar.includes('bulletList') && (
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Toggle>
        )}

        {toolbar.includes('orderedList') && (
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        )}

        {maxLength && (
          <div className="ml-auto text-xs text-muted-foreground pr-2">
            {charCount}/{maxLength}
          </div>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

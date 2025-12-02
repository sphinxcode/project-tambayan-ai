'use client'

import { ChatMessage } from '@/types'
import { ActiveToolCall } from '@/stores/chat-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: ChatMessage[]
  streamingMessageId: string | null
  streamingContent: string
  isThinking: boolean
  activeToolCalls: ActiveToolCall[]
}

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
  streamingContent?: string
}

function MessageBubble({ message, isStreaming, streamingContent }: MessageBubbleProps) {
  const isUser = message.role === 'USER'
  const content = isStreaming ? streamingContent : message.content

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn('h-8 w-8', isUser ? 'bg-pink-500' : 'bg-fuchsia-500')}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-pink-500 text-white'
            : 'bg-muted'
        )}
      >
        {/* Render content with basic formatting */}
        <div className={cn('text-sm whitespace-pre-wrap', !isUser && 'prose prose-sm max-w-none')}>
          {content || (isStreaming && <span className="opacity-50">...</span>)}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'text-xs mt-1',
            isUser ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 bg-fuchsia-500">
        <AvatarFallback>
          <Bot className="h-4 w-4 text-white" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      </div>
    </div>
  )
}

export function MessageList({
  messages,
  streamingMessageId,
  streamingContent,
  isThinking,
  activeToolCalls,
}: MessageListProps) {
  return (
    <div className="space-y-1">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
          streamingContent={message.id === streamingMessageId ? streamingContent : undefined}
        />
      ))}

      {isThinking && <ThinkingIndicator />}
    </div>
  )
}

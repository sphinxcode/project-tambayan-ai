'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Tool, ChatConfig, ChatMessage } from '@/types'
import { useChatStore, useCreditStore } from '@/stores'
import {
  getToolChatSessions,
  createChatSession,
  getChatSession,
  saveUserMessage,
  saveAssistantMessage,
  streamChatResponse,
} from '@/lib/api/chat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageList } from './message-list'
import { SessionTabs } from './session-tabs'
import { QuickActions } from './quick-actions'
import { Send, Plus, Loader2, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  tool: Tool
  config: ChatConfig | null
}

// Default config when none provided
const defaultConfig: ChatConfig = {
  chat: {
    welcomeMessage: 'Hello! How can I help you today?',
    placeholderText: 'Type your message...',
    quickActions: [],
  },
  features: {
    voiceInput: { enabled: false, payloadKey: 'voice' },
    fileUpload: { enabled: false, payloadKey: 'file', maxSizeMB: 10 },
    streaming: { enabled: true, endpoint: '' },
  },
  payloads: {
    messageKey: 'message',
    sessionKey: 'sessionId',
  },
}

export function ChatInterface({ tool, config }: ChatInterfaceProps) {
  // Merge config with defaults to ensure all properties exist
  const chatConfig: ChatConfig = {
    chat: {
      welcomeMessage: config?.chat?.welcomeMessage || defaultConfig.chat.welcomeMessage,
      placeholderText: config?.chat?.placeholderText || defaultConfig.chat.placeholderText,
      quickActions: config?.chat?.quickActions || defaultConfig.chat.quickActions,
    },
    features: {
      voiceInput: config?.features?.voiceInput || defaultConfig.features.voiceInput,
      fileUpload: config?.features?.fileUpload || defaultConfig.features.fileUpload,
      streaming: config?.features?.streaming || defaultConfig.features.streaming,
    },
    payloads: {
      messageKey: config?.payloads?.messageKey || defaultConfig.payloads.messageKey,
      sessionKey: config?.payloads?.sessionKey || defaultConfig.payloads.sessionKey,
    },
  }
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    sessions,
    currentSessionId,
    isLoadingSessions,
    isSendingMessage,
    streamingContent,
    isThinking,
    activeToolCalls,
    setSessions,
    addSession,
    setCurrentSession,
    addMessage,
    updateMessage,
    setStreamingMessage,
    appendStreamingContent,
    setThinking,
    addToolCall,
    removeToolCall,
    clearToolCalls,
    setLoadingSessions,
    setSendingMessage,
    getCurrentSession,
  } = useChatStore()

  const { hasEnoughCredits, deductCredits } = useCreditStore()

  // Fetch sessions on mount
  useEffect(() => {
    async function fetchSessions() {
      setLoadingSessions(true)
      try {
        const toolSessions = await getToolChatSessions(tool.id)
        setSessions(toolSessions)
        if (toolSessions.length > 0) {
          setCurrentSession(toolSessions[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
      } finally {
        setLoadingSessions(false)
      }
    }
    fetchSessions()
  }, [tool.id, setSessions, setCurrentSession, setLoadingSessions])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [streamingContent, currentSessionId])

  // Create new session
  const handleNewSession = async () => {
    try {
      const session = await createChatSession({
        toolId: tool.id,
        title: 'New Chat',
      })
      addSession(session)
      setCurrentSession(session.id)
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  // Send message
  const handleSend = useCallback(async () => {
    if (!message.trim() || isSendingMessage) return

    if (!hasEnoughCredits(tool.creditCost)) {
      alert('Insufficient credits')
      return
    }

    let sessionId = currentSessionId

    // Create session if none exists
    if (!sessionId) {
      try {
        const session = await createChatSession({
          toolId: tool.id,
          title: message.slice(0, 50),
        })
        addSession(session)
        setCurrentSession(session.id)
        sessionId = session.id
      } catch (err) {
        console.error('Failed to create session:', err)
        return
      }
    }

    setSendingMessage(true)
    setThinking(true)
    clearToolCalls()

    const userMessage = message
    setMessage('')

    try {
      // Save user message
      const savedUserMsg = await saveUserMessage({
        sessionId,
        content: userMessage,
      })
      addMessage(sessionId, savedUserMsg)

      // Create placeholder for assistant message
      const tempMsgId = `temp-${Date.now()}`
      const tempAssistantMsg: ChatMessage = {
        id: tempMsgId,
        sessionId,
        role: 'ASSISTANT',
        content: '',
        metadata: null,
        createdAt: new Date().toISOString(),
      }
      addMessage(sessionId, tempAssistantMsg)
      setStreamingMessage(tempMsgId, '')
      setThinking(false)

      // Stream response
      let fullContent = ''
      const cleanup = await streamChatResponse({
        sessionId,
        messageId: savedUserMsg.id,
        onChunk: (chunk) => {
          appendStreamingContent(chunk)
          fullContent += chunk
        },
        onComplete: async (finalMessage) => {
          // Save assistant message
          const savedAssistantMsg = await saveAssistantMessage({
            sessionId,
            content: finalMessage,
          })
          updateMessage(sessionId, tempMsgId, {
            id: savedAssistantMsg.id,
            content: finalMessage,
          })
          setStreamingMessage(null)
          deductCredits(tool.creditCost)
          setSendingMessage(false)
        },
        onError: (error) => {
          console.error('Stream error:', error)
          updateMessage(sessionId, tempMsgId, {
            content: 'Sorry, an error occurred. Please try again.',
          })
          setStreamingMessage(null)
          setSendingMessage(false)
        },
        onToolCallStart: (toolInfo) => {
          addToolCall(toolInfo)
        },
        onToolCallEnd: (toolInfo) => {
          removeToolCall(toolInfo.name)
        },
      })

      return cleanup
    } catch (err) {
      console.error('Failed to send message:', err)
      setSendingMessage(false)
      setThinking(false)
    }
  }, [
    message,
    currentSessionId,
    tool,
    isSendingMessage,
    hasEnoughCredits,
    addSession,
    setCurrentSession,
    setSendingMessage,
    setThinking,
    clearToolCalls,
    addMessage,
    setStreamingMessage,
    appendStreamingContent,
    updateMessage,
    deductCredits,
    addToolCall,
    removeToolCall,
  ])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle quick action click
  const handleQuickAction = (prompt: string) => {
    setMessage(prompt)
    inputRef.current?.focus()
  }

  const currentSession = getCurrentSession()
  const messages = currentSession?.messages || []
  const showWelcome = !currentSession || messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Session Tabs */}
      {sessions.length > 0 && (
        <SessionTabs
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelect={setCurrentSession}
          onNewSession={handleNewSession}
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
          {isLoadingSessions ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-1/2 ml-auto" />
              <Skeleton className="h-12 w-2/3" />
            </div>
          ) : showWelcome ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {chatConfig.chat.welcomeMessage}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start a conversation or use one of the quick actions below.
              </p>

              {/* Quick Actions */}
              {chatConfig.chat.quickActions.length > 0 && (
                <QuickActions
                  actions={chatConfig.chat.quickActions}
                  onSelect={handleQuickAction}
                />
              )}
            </div>
          ) : (
            <MessageList
              messages={messages}
              streamingMessageId={useChatStore.getState().streamingMessageId}
              streamingContent={streamingContent}
              isThinking={isThinking}
              activeToolCalls={activeToolCalls}
            />
          )}
        </ScrollArea>

        {/* Tool Call Indicators */}
        {activeToolCalls.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {activeToolCalls.map((tool) => (
              <Badge key={tool.name} variant="secondary" className="animate-pulse">
                Using {tool.name}...
              </Badge>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNewSession}
              disabled={isSendingMessage}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatConfig.chat.placeholderText}
              className="min-h-[44px] max-h-[120px] resize-none"
              disabled={isSendingMessage}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSendingMessage}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isSendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Each message uses {tool.creditCost} credit{tool.creditCost !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

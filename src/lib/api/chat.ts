import type { ChatSession, ChatMessage } from '@/types'
import { api, ApiError } from '../api'

/**
 * Chat API - For CHAT tool interactions
 */

export interface CreateSessionParams {
  toolId: string
  title?: string
}

export interface SendMessageParams {
  sessionId: string
  content: string
  metadata?: Record<string, unknown>
}

// Get all chat sessions for the current user
export async function getChatSessions(): Promise<ChatSession[]> {
  const response = await api.get<{ sessions: ChatSession[] }>('/api/public/chat/sessions')
  return response.sessions || []
}

// Get chat sessions for a specific tool
export async function getToolChatSessions(toolId: string): Promise<ChatSession[]> {
  const response = await api.get<{ sessions: ChatSession[] }>(`/api/public/chat/sessions?toolId=${toolId}`)
  return response.sessions || []
}

// Get a specific chat session with messages
export async function getChatSession(sessionId: string): Promise<ChatSession> {
  const response = await api.get<{ session: ChatSession }>(`/api/public/chat/sessions/${sessionId}`)
  if (!response.session) {
    throw new ApiError(404, 'Session not found')
  }
  return response.session
}

// Create a new chat session
export async function createChatSession(params: CreateSessionParams): Promise<ChatSession> {
  const response = await api.post<{ session: ChatSession }>('/api/public/chat/sessions', params)
  if (!response.session) {
    throw new ApiError(500, 'Failed to create session')
  }
  return response.session
}

// Send a message to a chat session
export async function sendChatMessage(params: SendMessageParams): Promise<{
  userMessage: ChatMessage
  assistantMessage: ChatMessage
  creditsUsed: number
  remainingCredits: number
}> {
  const response = await api.post<{
    success: boolean
    userMessage: ChatMessage
    message: ChatMessage // This is the assistant message
    creditsUsed: number
    remainingCredits: number
  }>(
    `/api/public/chat/sessions/${params.sessionId}/messages`,
    {
      content: params.content,
      metadata: params.metadata
    }
  )
  if (!response.userMessage) {
    throw new ApiError(500, 'Failed to send message')
  }
  return {
    userMessage: response.userMessage,
    assistantMessage: response.message, // Rename for clarity
    creditsUsed: response.creditsUsed,
    remainingCredits: response.remainingCredits
  }
}

// Delete a chat session (soft delete - archives it)
export async function deleteChatSession(sessionId: string): Promise<void> {
  await api.delete(`/api/public/chat/sessions/${sessionId}`)
}

// Archive a chat session
export async function archiveChatSession(sessionId: string): Promise<ChatSession> {
  const response = await api.patch<{ session: ChatSession }>(
    `/api/public/chat/sessions/${sessionId}/archive`,
    {}
  )
  if (!response.session) {
    throw new ApiError(500, 'Failed to archive session')
  }
  return response.session
}

// Unarchive a chat session
export async function unarchiveChatSession(sessionId: string): Promise<ChatSession> {
  const response = await api.patch<{ session: ChatSession }>(
    `/api/public/chat/sessions/${sessionId}/unarchive`,
    {}
  )
  if (!response.session) {
    throw new ApiError(500, 'Failed to unarchive session')
  }
  return response.session
}

// Rename a chat session
export async function renameChatSession(sessionId: string, title: string): Promise<ChatSession> {
  const response = await api.patch<{ session: ChatSession }>(
    `/api/public/chat/sessions/${sessionId}/rename`,
    { title }
  )
  if (!response.session) {
    throw new ApiError(500, 'Failed to rename session')
  }
  return response.session
}

// Permanently delete a chat session (from archive only)
export async function permanentlyDeleteChatSession(sessionId: string): Promise<void> {
  await api.delete(`/api/public/chat/sessions/${sessionId}/permanent`)
}

// Update session title (deprecated - use renameChatSession instead)
export async function updateChatSession(sessionId: string, updates: { title?: string }): Promise<ChatSession> {
  const response = await api.patch<{ session: ChatSession }>(
    `/api/public/chat/sessions/${sessionId}`,
    updates
  )
  if (!response.session) {
    throw new ApiError(500, 'Failed to update session')
  }
  return response.session
}

// Get archived sessions
export async function getArchivedChatSessions(toolId?: string): Promise<ChatSession[]> {
  const url = toolId
    ? `/api/public/chat/sessions?archived=true&toolId=${toolId}`
    : `/api/public/chat/sessions?archived=true`
  const response = await api.get<{ sessions: ChatSession[] }>(url)
  return response.sessions || []
}

// Save user message
export async function saveUserMessage(params: { sessionId: string; content: string }): Promise<ChatMessage> {
  const response = await api.post<{ message: ChatMessage }>(
    `/api/public/chat/sessions/${params.sessionId}/messages/user`,
    { content: params.content }
  )
  if (!response.message) {
    throw new ApiError(500, 'Failed to save user message')
  }
  return response.message
}

// Save assistant message
export async function saveAssistantMessage(params: { sessionId: string; content: string }): Promise<ChatMessage> {
  const response = await api.post<{ message: ChatMessage }>(
    `/api/public/chat/sessions/${params.sessionId}/messages/assistant`,
    { content: params.content }
  )
  if (!response.message) {
    throw new ApiError(500, 'Failed to save assistant message')
  }
  return response.message
}

// Server-Sent Events (SSE) for streaming responses
export interface ToolCallInfo {
  name: string
  description?: string
  nodeType?: string
}

export interface StreamingOptions {
  sessionId: string
  messageId: string
  onChunk: (chunk: string) => void
  onComplete: (fullMessage: string) => void
  onError: (error: Error) => void
  onToolCallStart?: (tool: ToolCallInfo) => void
  onToolCallEnd?: (tool: ToolCallInfo) => void
  onNodeExecute?: (nodeName: string, type: 'before' | 'after') => void
}

export async function streamChatResponse(options: StreamingOptions): Promise<() => void> {
  const { sessionId, messageId, onChunk, onComplete, onError, onToolCallStart, onToolCallEnd, onNodeExecute } = options

  // Get user ID from Supabase for authentication
  let userId: string | null = null
  if (typeof window !== 'undefined') {
    try {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch (error) {
      console.error('Failed to get user for SSE:', error)
    }
  }

  if (!userId) {
    onError(new Error('Authentication required for streaming'))
    return () => {}
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  // Pass userId as query parameter since EventSource can't send custom headers
  const url = `${apiUrl}/api/public/chat/sessions/${sessionId}/messages/${messageId}/stream?userId=${userId}`

  const eventSource = new EventSource(url, { withCredentials: true })

  let fullMessage = ''
  let hasReceivedContent = false // Track if we've received any actual content

  // Queue for typing animation - adds delay between chunks for natural feel
  let chunkQueue: string[] = []
  let isProcessingQueue = false
  // Configurable typing delay: Lower = faster, Higher = slower/more dramatic
  // 15-20ms = very fast (realtime feel)
  // 30-50ms = moderate speed (recommended for readability)
  // 80-100ms = slow/dramatic (good for emphasis)
  const TYPING_DELAY = 40 // milliseconds between chunks

  const processChunkQueue = async () => {
    if (isProcessingQueue || chunkQueue.length === 0) return
    isProcessingQueue = true

    while (chunkQueue.length > 0) {
      const chunk = chunkQueue.shift()!
      onChunk(chunk)

      // Add delay for typing effect (skip delay if queue is getting long to catch up)
      if (chunkQueue.length < 10) {
        await new Promise(resolve => setTimeout(resolve, TYPING_DELAY))
      }
    }

    isProcessingQueue = false
  }

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      // Extract content from various possible n8n formats
      let contentChunk: string | null = null

      // Format 1: n8n AG-UI protocol - {event: {type: 'text_message_content', data: {content: '...'}}}
      if (data.event?.type === 'text_message_content' && data.event?.data?.content) {
        contentChunk = data.event.data.content
      }
      // Format 2: Simple format - {type: 'item', content: '...'}
      else if (data.type === 'item' && data.content) {
        contentChunk = data.content
      }
      // Format 3: Data property - {type: 'chunk', data: '...'}
      else if ((data.type === 'chunk' || data.type === 'data') && data.data) {
        contentChunk = typeof data.data === 'string' ? data.data : data.data.content
      }
      // Format 4: Message property - {type: 'message', message: '...'}
      else if (data.message && typeof data.message === 'string') {
        contentChunk = data.message
      }
      // Format 5: Text property - {type: 'text', text: '...'}
      else if (data.text && typeof data.text === 'string') {
        contentChunk = data.text
      }
      // Format 6: Output property - {type: 'output', output: '...'}
      else if (data.output && typeof data.output === 'string') {
        contentChunk = data.output
      }
      // Format 7: Content at root - {type: 'content', content: '...'}
      else if (data.content && typeof data.content === 'string') {
        contentChunk = data.content
      }

      // Process content chunk if found
      if (contentChunk) {
        fullMessage += contentChunk
        hasReceivedContent = true // Mark that we've received actual content
        chunkQueue.push(contentChunk)
        processChunkQueue()
      }
      // Handle stream control signals
      else if (data.type === 'end' || data.event?.type === 'end') {
        // Don't close the EventSource - just log the marker
        // Stream will close naturally when backend ends the connection
      }
      else if (data.type === 'begin' || data.event?.type === 'begin') {
        // n8n signals start of stream - reset message
        fullMessage = ''
        chunkQueue = []
      }
      else if (data.type === 'error' || data.event?.type === 'error') {
        onError(new Error(data.message || data.event?.data?.message || 'Streaming error'))
        eventSource.close()
      }
      // Handle n8n AI agent tool calls
      else if (data.type === 'tool-call-start' || data.event?.type === 'tool-call-start') {
        const toolInfo: ToolCallInfo = {
          name: data.name || data.event?.data?.name || 'Tool',
          description: data.description || data.event?.data?.description,
          nodeType: data.nodeType || data.event?.data?.nodeType
        }
        onToolCallStart?.(toolInfo)
      }
      else if (data.type === 'tool-call-end' || data.event?.type === 'tool-call-end') {
        const toolInfo: ToolCallInfo = {
          name: data.name || data.event?.data?.name || 'Tool',
          description: data.description || data.event?.data?.description,
          nodeType: data.nodeType || data.event?.data?.nodeType
        }
        onToolCallEnd?.(toolInfo)
      }
      // Handle n8n node execution events
      else if (data.type === 'node-execute-before' || data.event?.type === 'node-execute-before') {
        const nodeName = data.nodeName || data.event?.data?.nodeName || 'Node'
        onNodeExecute?.(nodeName, 'before')
      }
      else if (data.type === 'node-execute-after' || data.event?.type === 'node-execute-after') {
        const nodeName = data.nodeName || data.event?.data?.nodeName || 'Node'
        onNodeExecute?.(nodeName, 'after')
      }
    } catch (error) {
      console.error('[SSE] Parse error:', error)
      onError(new Error('Failed to parse streaming response'))
      eventSource.close()
    }
  }

  eventSource.onerror = () => {
    // EventSource fires 'error' when stream ends normally OR on actual error
    // Check if we received content - if yes, this is normal completion
    if (hasReceivedContent && fullMessage.length > 0) {
      // Wait for queue to finish processing
      const waitForQueue = setInterval(() => {
        if (chunkQueue.length === 0 && !isProcessingQueue) {
          clearInterval(waitForQueue)
          onComplete(fullMessage)
          eventSource.close()
        }
      }, 100)
    } else if (hasReceivedContent && fullMessage.length === 0) {
      // Received content markers but message is empty - this shouldn't happen
      onError(new Error('Stream ended with empty response'))
      eventSource.close()
    } else {
      // No content received at all - connection error
      onError(new Error('Connection lost'))
      eventSource.close()
    }
  }

  // Return cleanup function
  return () => {
    eventSource.close()
  }
}

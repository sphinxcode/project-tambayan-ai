import { create } from 'zustand'
import type { ChatSession, ChatMessage } from '@/types'

export interface ActiveToolCall {
  name: string
  description?: string
  nodeType?: string
  startedAt: number
}

interface ChatState {
  // Sessions
  sessions: ChatSession[]
  archivedSessions: ChatSession[]
  currentSessionId: string | null
  isLoadingSessions: boolean
  showArchive: boolean

  // Messages
  isLoadingMessages: boolean
  isSendingMessage: boolean

  // Streaming
  streamingMessageId: string | null
  streamingContent: string
  isThinking: boolean

  // Tool calls (for AI agents using tools like Wikipedia)
  activeToolCalls: ActiveToolCall[]

  // Error state
  error: string | null

  // Actions
  setSessions: (sessions: ChatSession[]) => void
  setArchivedSessions: (sessions: ChatSession[]) => void
  addSession: (session: ChatSession) => void
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void
  deleteSession: (sessionId: string) => void
  archiveSession: (sessionId: string) => void
  unarchiveSession: (sessionId: string) => void
  setCurrentSession: (sessionId: string | null) => void
  setShowArchive: (show: boolean) => void

  addMessage: (sessionId: string, message: ChatMessage) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void

  setStreamingMessage: (messageId: string | null, content?: string) => void
  appendStreamingContent: (content: string) => void
  setThinking: (thinking: boolean) => void

  addToolCall: (tool: Omit<ActiveToolCall, 'startedAt'>) => void
  removeToolCall: (toolName: string) => void
  clearToolCalls: () => void

  setLoadingSessions: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
  setError: (error: string | null) => void

  // Helpers
  getCurrentSession: () => ChatSession | undefined
  getSessionMessages: (sessionId: string) => ChatMessage[]
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  sessions: [],
  archivedSessions: [],
  currentSessionId: null,
  isLoadingSessions: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  streamingMessageId: null,
  streamingContent: '',
  isThinking: false,
  activeToolCalls: [],
  showArchive: false,
  error: null,

  // Actions
  setSessions: (sessions) => set({ sessions }),
  setArchivedSessions: (sessions) => set({ archivedSessions: sessions }),

  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions]
  })),

  updateSession: (sessionId, updates) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === sessionId ? { ...s, ...updates } : s
    ),
    archivedSessions: state.archivedSessions.map((s) =>
      s.id === sessionId ? { ...s, ...updates } : s
    )
  })),

  deleteSession: (sessionId) => set((state) => ({
    sessions: state.sessions.filter((s) => s.id !== sessionId),
    archivedSessions: state.archivedSessions.filter((s) => s.id !== sessionId),
    currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
  })),

  archiveSession: (sessionId) => set((state) => {
    const session = state.sessions.find((s) => s.id === sessionId)
    if (!session) return state
    return {
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      archivedSessions: [session, ...state.archivedSessions],
      currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
    }
  }),

  unarchiveSession: (sessionId) => set((state) => {
    const session = state.archivedSessions.find((s) => s.id === sessionId)
    if (!session) return state
    return {
      archivedSessions: state.archivedSessions.filter((s) => s.id !== sessionId),
      sessions: [session, ...state.sessions]
    }
  }),

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  setShowArchive: (show) => set({ showArchive: show }),

  addMessage: (sessionId, message) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, messages: [...(s.messages || []), message] }
        : s
    )
  })),

  updateMessage: (sessionId, messageId, updates) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            messages: s.messages.map((m) =>
              m.id === messageId ? { ...m, ...updates } : m
            )
          }
        : s
    )
  })),

  setStreamingMessage: (messageId, content = '') => set({
    streamingMessageId: messageId,
    streamingContent: content
  }),

  appendStreamingContent: (content) => set((state) => ({
    streamingContent: state.streamingContent + content
  })),

  setThinking: (thinking) => set({ isThinking: thinking }),

  addToolCall: (tool) => set((state) => ({
    activeToolCalls: [...state.activeToolCalls, { ...tool, startedAt: Date.now() }]
  })),

  removeToolCall: (toolName) => set((state) => ({
    activeToolCalls: state.activeToolCalls.filter((t) => t.name !== toolName)
  })),

  clearToolCalls: () => set({ activeToolCalls: [] }),

  setLoadingSessions: (loading) => set({ isLoadingSessions: loading }),
  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setSendingMessage: (sending) => set({ isSendingMessage: sending }),
  setError: (error) => set({ error }),

  // Helpers
  getCurrentSession: () => {
    const state = get()
    return state.sessions.find((s) => s.id === state.currentSessionId)
  },

  getSessionMessages: (sessionId) => {
    const state = get()
    const session = state.sessions.find((s) => s.id === sessionId)
    return session?.messages || []
  }
}))

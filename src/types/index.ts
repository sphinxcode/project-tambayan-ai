// User types
export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  supabaseId: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

// Subscription types
export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY'
export type SubStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'PAUSED'
export type BillingCycle = 'MONTHLY' | 'ANNUAL'

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubId: string | null
  plan: PlanType
  status: SubStatus
  billingCycle: BillingCycle
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

// Credit types
export interface UserCredit {
  id: string
  userId: string
  balance: number
  bonusCredits?: number
  lastResetAt?: string | null
  createdAt?: string
  updatedAt: string
}

// Tool types
export type ToolType = 'FORM' | 'CHAT' | 'SCHEDULE'

export interface Tool {
  id: string
  name: string
  slug?: string
  description: string
  shortDescription?: string | null
  icon?: string | null
  creditCost: number
  type: ToolType
  isActive?: boolean
  isFeatured?: boolean
  usageCount?: number
  averageRating?: number | null
  reviewCount?: number
  categories?: ToolCategory[]
  config?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export interface ToolCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number
  isActive: boolean
}

// Favorite types
export interface Favorite {
  id: string
  userId: string
  toolId: string
  tool: Tool
  createdAt: string
}

// Chat types
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface ChatSession {
  id: string
  userId: string
  toolId: string
  tool: Tool
  title: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

// Tool Usage / Execution types
export type UsageStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'

export interface ToolUsage {
  id: string
  userId: string
  toolId: string
  tool?: Tool
  creditsUsed: number
  status: UsageStatus
  requestPayload: Record<string, unknown> | null
  responseData: Record<string, unknown> | null
  executionTimeMs: number | null
  createdAt: string
  updatedAt?: string
}

// Schedule types
export interface ScheduleConfigEntry {
  id: string
  userId: string
  toolId: string
  tool: Tool
  name: string
  description?: string
  cronExpression: string
  timezone: string
  inputData: Record<string, unknown>
  isActive: boolean
  nextRunAt: string | null
  lastRunAt: string | null
  lastRunStatus: UsageStatus | null
  createdAt: string
  updatedAt: string
  executions?: ScheduleExecution[]
}

export interface ScheduleExecution {
  id: string
  scheduleId: string
  status: UsageStatus
  startedAt: string
  completedAt: string | null
  executionTimeMs: number | null
  output: Record<string, unknown> | null
  error: string | null
  creditsUsed: number
  toolUsageId: string | null
}

// Feedback types
export interface ToolFeedback {
  id: string
  userId: string
  toolId: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
}

// Pricing types
export interface PricingPlan {
  name: string
  plan: PlanType
  credits: number
  monthlyPrice: number
  annualPrice: number
  features: string[]
  isPopular?: boolean
}

export interface CreditPack {
  credits: number
  price: number
  priceId: string
}

// Tool Config Types
export type FieldType =
  // HTML5 Basic
  | 'text' | 'email' | 'url' | 'tel' | 'password'
  | 'number' | 'textarea'
  | 'date' | 'time' | 'datetime-local'
  // Selection
  | 'select' | 'multi-select' | 'checkbox' | 'radio'
  // Advanced
  | 'file' | 'rich-text'
  // Additional
  | 'hidden' | 'html'

export interface FormField {
  id: string
  type: FieldType
  label: string
  description?: string
  placeholder?: string
  payloadKey: string
  required: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    customMessage?: string
  }
  options?: { value: string; label: string; disabled?: boolean }[]
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
  richTextOptions?: {
    toolbar: ('bold' | 'italic' | 'underline' | 'link' | 'bulletList' | 'orderedList')[]
    maxLength?: number
  }
  htmlContent?: string
  defaultValue?: string | string[] | boolean | number
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fieldIds: string[]
}

export interface ExpectedOutput {
  type: 'document' | 'image' | 'video' | 'text' | 'mixed' | 'auto'
  downloadFileName?: string
}

export interface FormConfig {
  fields: FormField[]
  submitButton: {
    text: string
    loadingText: string
  }
  responseHandling: {
    type: 'display' | 'email' | 'both'
    successMessage?: string
    emailField?: string | null
  }
  layout?: 'single-column' | 'multi-step'
  steps?: FormStep[]
  expectedOutput?: ExpectedOutput
}

export interface QuickAction {
  id: string
  label: string
  prompt: string
  icon?: string
  color?: string
}

export interface ChatConfig {
  chat: {
    welcomeMessage: string
    placeholderText: string
    quickActions: QuickAction[]
  }
  features: {
    voiceInput: {
      enabled: boolean
      payloadKey: string
    }
    fileUpload: {
      enabled: boolean
      payloadKey: string
      accept?: string
      maxSizeMB: number
    }
    streaming: {
      enabled: boolean
      endpoint: string
    }
  }
  payloads: {
    messageKey: string
    sessionKey: string
  }
}

export interface ScheduleConfig {
  schedule: {
    cronExpression: string
    timezone: string
    enabled: boolean
  }
  parameters: Array<{
    key: string
    value: string
    description?: string
  }>
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    email?: string
  }
}

// Dashboard Stats
export interface DashboardStats {
  toolsRunThisMonth: number
  creditsUsedThisMonth: number
  availableTools: number
  successRate: number
}

// Usage Stats
export interface UsageStats {
  daily: { date: string; executions: number; credits: number }[]
  weekly: { week: string; executions: number; credits: number }[]
  monthly: { month: string; executions: number; credits: number }[]
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Execute Tool types
export interface ExecuteToolParams {
  inputs: Record<string, unknown>
}

export interface ExecuteToolResponse {
  success: boolean
  result: unknown
  creditsUsed: number
  executionId: string
}

// Credit Transaction
export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  description: string
  createdAt: string
}

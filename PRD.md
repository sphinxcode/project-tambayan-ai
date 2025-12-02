# Tambayan Frontend V2 - Product Requirements Document

## Project Overview

**Project Name**: Tambayan Frontend V2
**Version**: 2.0.0
**Created**: December 2, 2025
**Status**: Planning Phase

### Executive Summary

A complete redesign and rebuild of the Tambayan PH AI Automation Tools dashboard, utilizing the CRM UI Kit for SaaS Dashboards Figma template as the design foundation while maintaining all existing functionality. The new version will feature a modern, professional UI with shadcn/ui components, a collapsible sidebar with avatar support, enhanced dashboard widgets, and improved user experience.

---

## Design Philosophy

### Visual Identity
- **Primary Color**: Pink/Fuchsia (#ec4899) with full shade spectrum (50-900)
- **Accent Color**: Fuchsia (#d946ef)
- **Background**: Light mode with subtle gray tones
- **Cards**: White with subtle shadows, rounded corners (radius: 8-12px)
- **Typography**: Inter font family
- **Icons**: Lucide React icon set

### Figma Reference
- **Template**: CRM UI Kit for SaaS Dashboards (Community)
- **Key Elements**:
  - Collapsible sidebar with icon-only and full-width modes
  - Card-based dashboard layout with stat widgets
  - Clean data tables with actions
  - Modern form inputs with icons
  - Professional navigation patterns

---

## Technology Stack

### Core Framework
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript 5.7+**

### UI & Styling
- **shadcn/ui** - Base component library
- **Tailwind CSS 3.4** - Utility-first styling
- **Lucide React** - Icon library
- **Recharts** - Data visualization (charts)
- **tailwind-merge** & **clsx** - Class utilities
- **class-variance-authority** - Component variants

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod integration

### State Management
- **Zustand** - Global state with persistence

### Authentication
- **Supabase** - Auth provider (existing integration)

### Rich Content
- **TipTap** - Rich text editor
- **React Markdown** - Markdown rendering
- **KaTeX** - Math rendering
- **React Syntax Highlighter** - Code blocks

### File Handling
- **React Dropzone** - File uploads

### Utilities
- **date-fns** - Date formatting
- **sonner** - Toast notifications

---

## Feature Parity Checklist

All features from `tambayan-frontend` must be preserved:

### Authentication
- [ ] Email/password login & signup
- [ ] OAuth (Google, GitHub)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management via middleware
- [ ] Protected route redirects

### Dashboard
- [ ] Welcome stats cards (tools run, credits, available tools)
- [ ] Quick action buttons
- [ ] Execution history widget
- [ ] Charts (usage trends, tool popularity)

### Tools System
- [ ] Tool listing with grid cards
- [ ] Search functionality
- [ ] Category filtering with pills
- [ ] Pagination
- [ ] Favorites (heart toggle, localStorage persistence)
- [ ] Tool detail pages

### Form Tools
- [ ] Dynamic form rendering from config
- [ ] All field types: text, email, url, tel, password, number, textarea, date, time, select, multi-select, checkbox, radio, file, rich-text, hidden, html
- [ ] Zod schema generation from fields
- [ ] File upload with restrictions
- [ ] Execution status polling
- [ ] Result display (success/error/loading cards)
- [ ] Download results

### Chat Tools
- [ ] Session management (create, rename, archive, delete, restore)
- [ ] SSE streaming with typing animation
- [ ] Message history
- [ ] Tool call visualization
- [ ] Welcome messages & quick actions
- [ ] Archive view with permanent delete

### Schedule Tools
- [ ] CRON expression builder UI
- [ ] Timezone selection
- [ ] Schedule CRUD operations
- [ ] Toggle enable/disable
- [ ] Execution history per schedule
- [ ] Notification preferences (email, Telegram)

### Credits System
- [ ] Balance display (balance + bonus)
- [ ] Credit deduction per execution
- [ ] Insufficient credits warning
- [ ] Credit history (if applicable)

### API Integration
- [ ] All existing endpoints preserved
- [ ] X-User-ID header authentication
- [ ] Error handling patterns

---

## Phase 1: Foundation & Core Layout

### Duration: Core Infrastructure

### Objectives
1. Project scaffolding with Next.js 14 App Router
2. shadcn/ui setup and configuration
3. Tailwind CSS with pink/fuchsia theme
4. Collapsible sidebar component
5. Dashboard layout structure
6. Authentication pages (login, signup, forgot-password)

### Deliverables

#### 1.1 Project Setup
```
tambayan-frontend-v2/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── tools/page.tsx
│   │   │   ├── tools/[id]/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   └── layout.tsx
│   │   ├── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── sidebar-header.tsx
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── sidebar-footer.tsx
│   │   │   ├── dashboard-header.tsx
│   │   │   └── breadcrumbs.tsx
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       ├── signup-form.tsx
│   │       ├── forgot-password-form.tsx
│   │       └── oauth-buttons.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts
├── components.json              # shadcn/ui config
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

#### 1.2 Sidebar Component Features
- **Collapsible**: Toggle between icon-only (64px) and full-width (280px)
- **Sections**:
  - Header: Logo + App name (collapsible)
  - Navigation: Dashboard, Tools, History
  - User Section: Avatar, name, email (with photo avatar support)
  - Credits Display: Balance badge
  - Footer: Collapse toggle button
- **State Persistence**: Remember collapsed state in localStorage
- **Mobile**: Sheet overlay on mobile devices
- **Keyboard**: Cmd/Ctrl + B to toggle

#### 1.3 Theme Configuration
```typescript
// tailwind.config.ts - Color palette
colors: {
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',  // Main primary
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',  // Main accent
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  }
}
```

#### 1.4 Authentication Pages
- **Login**: Email/password + OAuth buttons + Remember me
- **Signup**: Full name, email, password with requirements indicator
- **Forgot Password**: Email input with success message
- **Reset Password**: New password with confirmation
- **Verify Email**: Confirmation message with resend option

#### 1.5 shadcn/ui Components to Install
```bash
npx shadcn@latest init
npx shadcn@latest add sidebar
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
npx shadcn@latest add breadcrumb
npx shadcn@latest add sheet
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add checkbox
npx shadcn@latest add tooltip
npx shadcn@latest add sonner
```

### Acceptance Criteria
- [ ] Project runs with `npm run dev`
- [ ] Sidebar collapses/expands smoothly with animation
- [ ] Sidebar shows user avatar (photo or initials fallback)
- [ ] Auth pages match Figma styling
- [ ] OAuth buttons functional with Supabase
- [ ] Protected routes redirect to login
- [ ] Pink/fuchsia theme applied consistently
- [ ] Mobile responsive with sheet sidebar

---

## Phase 2: Dashboard & Tools

### Duration: Feature Implementation

### Objectives
1. Dashboard page with stats, charts, and widgets
2. Tools listing page with grid cards
3. Tool detail page with dynamic interface rendering
4. Form tool execution
5. Chat tool with SSE streaming
6. Schedule tool management

### Deliverables

#### 2.1 Dashboard Components
```
src/components/dashboard/
├── stats-cards.tsx              # Tool runs, credits, available tools
├── usage-chart.tsx              # Line/area chart for usage trends
├── tool-popularity-chart.tsx   # Bar/pie chart for popular tools
├── recent-executions.tsx       # Table of recent tool runs
├── quick-actions.tsx           # Action buttons grid
└── welcome-banner.tsx          # User greeting with tips
```

**Stats Cards Design**:
- Icon on left (colored background)
- Title, value, trend indicator
- Subtle shadow, rounded corners

**Charts**:
- Usage over time (area chart)
- Tools by category (pie/donut)
- Credit consumption (bar chart)

#### 2.2 Tools Page Components
```
src/components/tools/
├── tool-grid.tsx               # Responsive grid container
├── tool-card.tsx               # Individual tool card
├── search-bar.tsx              # Search input with icon
├── category-pills.tsx          # Horizontal scrollable pills
├── pagination.tsx              # Page navigation
└── favorite-button.tsx         # Heart toggle
```

**Tool Card Design** (from Figma):
- White card with subtle shadow
- Tool icon/emoji at top
- Tool name (bold)
- Short description (muted)
- Credits badge
- Rating stars (if available)
- Favorite heart button (top right)
- Hover: slight elevation

#### 2.3 Tool Detail Page
```
src/components/tool-detail/
├── tool-header.tsx             # Icon, name, description, credits
├── tool-interface.tsx          # Renders form/chat/schedule based on type
└── tool-sidebar.tsx            # Tool info, related tools (optional)
```

#### 2.4 Form Tool Components
```
src/components/form/
├── form-renderer.tsx           # Main form orchestrator
├── single-column-form.tsx      # Single column layout
├── fields/
│   ├── text-field.tsx
│   ├── textarea-field.tsx
│   ├── number-field.tsx
│   ├── date-field.tsx
│   ├── select-field.tsx
│   ├── multi-select-field.tsx
│   ├── checkbox-field.tsx
│   ├── radio-group-field.tsx
│   ├── file-upload-field.tsx
│   ├── rich-text-field.tsx
│   ├── html-field.tsx
│   ├── password-field.tsx
│   └── hidden-field.tsx
├── results/
│   ├── loading-card.tsx
│   ├── success-card.tsx
│   └── error-card.tsx
└── utils/
    ├── form-schema.ts          # Zod schema generator
    └── output-detector.ts      # Output type detection
```

#### 2.5 Chat Tool Components
```
src/components/chat/
├── chat-interface.tsx          # Main chat orchestrator
├── chat-tabs.tsx               # Session tabs with actions
├── message-list.tsx            # Message display
├── message-input.tsx           # User input with send
├── markdown-message.tsx        # Markdown rendering
├── typing-indicator.tsx        # Loading animation
├── tool-call-badge.tsx         # Active tool indicator
└── archive-view.tsx            # Archived sessions
```

#### 2.6 Schedule Tool Components
```
src/components/schedule/
├── schedule-form.tsx           # Create/edit schedule
├── cron-builder.tsx            # Visual CRON builder
├── schedule-list.tsx           # List with actions
├── schedule-history.tsx        # Execution history
└── notification-settings.tsx   # Email/Telegram config
```

#### 2.7 Additional shadcn/ui Components
```bash
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add progress
npx shadcn@latest add skeleton
npx shadcn@latest add scroll-area
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add chart
```

### Acceptance Criteria
- [ ] Dashboard displays real data from API
- [ ] Charts render with actual usage data
- [ ] Tools grid loads with pagination
- [ ] Search filters tools in real-time
- [ ] Category pills filter correctly
- [ ] Favorites persist across sessions
- [ ] Form tools execute and poll for results
- [ ] Chat tools stream messages via SSE
- [ ] Schedule tools create/edit CRON jobs
- [ ] All field types render correctly
- [ ] File uploads work with restrictions

---

## Phase 3: Polish & Enhancement

### Duration: Refinement

### Objectives
1. Loading states and skeletons
2. Error boundaries and fallbacks
3. Animations and transitions
4. Accessibility improvements
5. Performance optimization
6. Final testing and bug fixes

### Deliverables

#### 3.1 Loading States
- Skeleton loaders for all data-fetching components
- Button loading states with spinners
- Page transition indicators
- Optimistic UI updates

#### 3.2 Error Handling
```
src/components/error/
├── error-boundary.tsx          # React error boundary
├── error-fallback.tsx          # Error display component
├── not-found.tsx               # 404 page
└── api-error-handler.ts        # Centralized API error handling
```

#### 3.3 Animations
- Sidebar collapse/expand (300ms ease)
- Card hover effects (transform, shadow)
- Page transitions (fade)
- Toast notifications (slide-in)
- Button interactions (scale on press)

#### 3.4 Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Color contrast compliance

#### 3.5 Performance
- Image optimization with next/image
- Code splitting by route
- Component lazy loading
- API response caching
- Debounced search input

#### 3.6 Additional Features
- Keyboard shortcuts (documented)
- Theme persistence
- Responsive breakpoints tested
- Print styles (if applicable)

### Acceptance Criteria
- [ ] All loading states implemented
- [ ] Error boundaries catch and display errors gracefully
- [ ] Animations feel smooth (60fps)
- [ ] Lighthouse accessibility score > 90
- [ ] Lighthouse performance score > 80
- [ ] All keyboard shortcuts work
- [ ] Mobile experience polished
- [ ] No console errors in production build

---

## API Endpoints Reference

### Base URL
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Endpoints (Preserved from V1)

#### Tools
- `GET /api/public/tools` - List tools (pagination, search, category, sort)
- `GET /api/public/tools/{id}` - Get tool details
- `GET /api/public/tools/categories` - List categories
- `POST /api/public/tools/{id}/execute` - Execute tool

#### Chat
- `GET /api/public/chat/sessions` - List sessions
- `GET /api/public/chat/sessions/{id}` - Get session with messages
- `POST /api/public/chat/sessions` - Create session
- `POST /api/public/chat/sessions/{id}/messages` - Send message
- `POST /api/public/chat/sessions/{id}/messages/user` - Save user message
- `POST /api/public/chat/sessions/{id}/messages/assistant` - Save assistant message
- `PATCH /api/public/chat/sessions/{id}/archive` - Archive session
- `PATCH /api/public/chat/sessions/{id}/unarchive` - Restore session
- `PATCH /api/public/chat/sessions/{id}/rename` - Rename session
- `DELETE /api/public/chat/sessions/{id}` - Soft delete
- `DELETE /api/public/chat/sessions/{id}/permanent` - Permanent delete
- `GET /api/public/chat/sessions/{id}/messages/{messageId}/stream` - SSE stream

#### Credits
- `GET /api/public/credits/balance` - Get balance
- `GET /api/public/subscription` - Get subscription
- `GET /api/public/stats` - Get dashboard stats

#### Schedules
- `GET /api/public/schedules` - List schedules
- `GET /api/public/schedules/{id}` - Get schedule
- `POST /api/public/schedules` - Create schedule
- `PATCH /api/public/schedules/{id}` - Update schedule
- `PATCH /api/public/schedules/{id}/toggle` - Toggle active
- `DELETE /api/public/schedules/{id}` - Delete schedule
- `GET /api/public/schedules/{id}/executions` - Execution history

#### Executions
- `GET /api/public/executions` - List executions
- `GET /api/public/executions/{id}` - Get execution details

---

## Zustand Stores Structure

### toolStore
```typescript
interface ToolStore {
  tools: Tool[];
  pagination: Pagination;
  filters: ToolFilters;
  isLoading: boolean;
  error: string | null;
  // Actions
  setTools: (tools: Tool[]) => void;
  setFilters: (filters: Partial<ToolFilters>) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}
```

### chatStore
```typescript
interface ChatStore {
  sessions: ChatSession[];
  archivedSessions: ChatSession[];
  currentSessionId: string | null;
  streamingMessageId: string | null;
  streamingContent: string;
  isThinking: boolean;
  activeToolCalls: ToolCall[];
  showArchive: boolean;
  // Actions
  addSession: (session: ChatSession) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  deleteSession: (id: string) => void;
  setCurrentSession: (id: string | null) => void;
  appendStreamingContent: (content: string) => void;
  // ... more actions
}
```

### creditStore
```typescript
interface CreditStore {
  credits: UserCredit | null;
  subscription: Subscription | null;
  isLoading: boolean;
  // Actions
  setCredits: (credits: UserCredit) => void;
  deductCredits: (amount: number) => void;
  hasEnoughCredits: (amount: number) => boolean;
  getTotalCredits: () => number;
}
```

### favoriteStore (Persisted)
```typescript
interface FavoriteStore {
  favoriteIds: string[];
  // Actions
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
}
```

---

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `tool-card.tsx`)
- **Pages**: `page.tsx` in route folder
- **Layouts**: `layout.tsx` in route folder
- **Hooks**: `use-[name].ts` (e.g., `use-mobile.ts`)
- **Stores**: `[name]-store.ts` (e.g., `tool-store.ts`)
- **Types**: `index.ts` or `[domain].ts`
- **Utils**: `[name].ts` (e.g., `form-schema.ts`)

---

## Context7 Library References

Use these Context7 library IDs for documentation lookup:

- **shadcn/ui**: `/websites/ui_shadcn`
- **Next.js App Router**: `/websites/nextjs_app`
- **Tailwind CSS**: `/websites/v3_tailwindcss`
- **React Hook Form**: `/react-hook-form/react-hook-form`
- **Zustand**: `/pmndrs/zustand`
- **Recharts**: `/recharts/recharts`

---

## Success Metrics

1. **Feature Parity**: 100% of V1 features working
2. **Performance**: Lighthouse score > 80
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Code Quality**: TypeScript strict mode, no errors
5. **Bundle Size**: < 500KB initial JS
6. **Time to Interactive**: < 3 seconds on 3G

---

## Notes for Implementation

1. **Start with shadcn/ui CLI** - Use `npx shadcn@latest add` for all components
2. **Copy API functions** from V1 - Don't rewrite, just reorganize
3. **Preserve Zustand stores** - Same structure, update types if needed
4. **Test with real API** - Use same backend as V1
5. **Mobile-first** - Design for mobile, enhance for desktop
6. **Incremental migration** - One feature at a time, test thoroughly

---

## Appendix: Figma Component Mapping

| Figma Component | shadcn/ui Component |
|-----------------|---------------------|
| Navigation Sidebar | Sidebar + SidebarMenu |
| Stats Card | Card + custom content |
| Data Table | Table + DataTable |
| Form Input | Input + InputGroup |
| Select Dropdown | Select |
| Modal Dialog | Dialog |
| Toast Notification | Sonner |
| Dropdown Menu | DropdownMenu |
| Tabs | Tabs |
| Badge | Badge |
| Avatar | Avatar |
| Button | Button (variants) |
| Checkbox | Checkbox |
| Radio | RadioGroup |
| Switch | Switch |
| Progress | Progress |
| Slider | Slider |
| Calendar | Calendar |
| Breadcrumb | Breadcrumb |

---

*Document Version: 1.0*
*Last Updated: December 2, 2025*

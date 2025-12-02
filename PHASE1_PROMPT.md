# Phase 1 Initial Prompt - Foundation & Core Layout

Copy and send this prompt to start Phase 1 implementation:

---

## PROMPT START

You are building **Tambayan Frontend V2**, a complete redesign of an AI automation tools dashboard. This is Phase 1: Foundation & Core Layout.

### Project Context
- **Location**: `E:\AI-Terminal\rdavid.dev\projects\project-tambayanapps\tambayan-frontend-v2`
- **Reference Project**: `E:\AI-Terminal\rdavid.dev\projects\project-tambayanapps\tambayan-frontend` (original V1)
- **PRD Document**: Read `./PRD.md` for full specifications

### Phase 1 Objectives
Build the foundational infrastructure with these components:

1. **Project Scaffolding**
   - Next.js 14 App Router with TypeScript
   - shadcn/ui initialization with pink/fuchsia theme
   - Tailwind CSS configuration
   - Folder structure as specified in PRD

2. **Collapsible Sidebar** (Critical Feature)
   - Uses shadcn/ui Sidebar component
   - Toggle between icon-only (64px) and full-width (280px)
   - Smooth animation (300ms ease)
   - Sections: Header (logo), Navigation, User profile with PHOTO AVATAR, Credits badge, Footer with toggle
   - Mobile: Sheet overlay
   - Keyboard: Cmd/Ctrl + B to toggle
   - State persistence in localStorage

3. **Dashboard Layout**
   - SidebarProvider wrapping the app
   - SidebarInset for main content
   - Dashboard header with breadcrumbs
   - Responsive grid for content

4. **Authentication Pages**
   - Login page with email/password + OAuth (Google, GitHub)
   - Signup page with password requirements indicator
   - Forgot password page
   - Reset password page (token-based)
   - Verify email page
   - Auth callback route for OAuth

5. **Supabase Integration**
   - Copy Supabase client config from V1
   - Middleware for route protection
   - Session management

### Technical Requirements

**Install these shadcn/ui components:**
```bash
npx shadcn@latest init
npx shadcn@latest add sidebar button input card avatar badge dropdown-menu separator breadcrumb sheet form label checkbox tooltip sonner
```

**Tailwind Theme Colors (pink/fuchsia):**
```typescript
primary: {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',  // Main
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
},
```

**Key Dependencies:**
```json
{
  "next": "^14.2.18",
  "react": "^18.3.1",
  "typescript": "^5.7.2",
  "@supabase/supabase-js": "^2.47.10",
  "@supabase/ssr": "^0.5.2",
  "zustand": "^5.0.2",
  "lucide-react": "^0.468.0",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

### File Structure to Create
```
tambayan-frontend-v2/
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
│   │   │   └── layout.tsx
│   │   ├── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx (redirect to /dashboard or /login)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── sidebar-header.tsx
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── sidebar-footer.tsx
│   │   │   ├── sidebar-user.tsx
│   │   │   └── dashboard-header.tsx
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       ├── signup-form.tsx
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
├── components.json
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

### Sidebar Implementation Details

The sidebar MUST have these features:

1. **Collapsible State**
   - `collapsible="icon"` prop on Sidebar
   - Uses `useSidebar()` hook for state
   - `SidebarRail` for drag-to-collapse

2. **User Section with Avatar**
   ```tsx
   <SidebarFooter>
     <SidebarMenu>
       <SidebarMenuItem>
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <SidebarMenuButton>
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user.avatarUrl} />
                 <AvatarFallback>{initials}</AvatarFallback>
               </Avatar>
               <div className="flex flex-col">
                 <span>{user.name}</span>
                 <span className="text-xs text-muted-foreground">{user.email}</span>
               </div>
             </SidebarMenuButton>
           </DropdownMenuTrigger>
           <DropdownMenuContent>
             {/* Profile, Settings, Logout */}
           </DropdownMenuContent>
         </DropdownMenu>
       </SidebarMenuItem>
     </SidebarMenu>
   </SidebarFooter>
   ```

3. **Credits Display**
   - Show as badge in sidebar
   - Format: "500 credits" or "5.2k credits"

4. **Navigation Items**
   - Dashboard (Home icon)
   - Tools (Wrench icon)
   - History (Clock icon)

### Reference: Copy from V1
- `tambayan-frontend/src/lib/supabase/` - Supabase config
- `tambayan-frontend/src/middleware.ts` - Route protection logic
- `tambayan-frontend/src/types/index.ts` - Type definitions

### Use Context7 for Documentation
```
shadcn/ui: /websites/ui_shadcn
Next.js: /websites/nextjs_app
Tailwind: /websites/v3_tailwindcss
```

### Acceptance Criteria
- [ ] `npm run dev` works without errors
- [ ] Sidebar collapses/expands with smooth animation
- [ ] User avatar shows photo (with initials fallback)
- [ ] Login page has email + OAuth buttons
- [ ] Signup page shows password requirements
- [ ] Protected routes redirect to login
- [ ] Auth redirects to dashboard after login
- [ ] Pink/fuchsia theme applied throughout
- [ ] Mobile sidebar works as sheet overlay

### DO NOT
- Create charts or dashboard widgets (Phase 2)
- Build tool listing or execution (Phase 2)
- Add complex animations (Phase 3)
- Over-engineer - keep it simple

### START BY
1. Initialize the Next.js project
2. Install and configure shadcn/ui
3. Set up Tailwind with custom colors
4. Build the collapsible sidebar
5. Create auth pages and forms
6. Add Supabase integration
7. Test the full auth flow

---

## PROMPT END

---

## Quick Reference Commands

```bash
# Create project
npx create-next-app@latest tambayan-frontend-v2 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Initialize shadcn/ui
cd tambayan-frontend-v2
npx shadcn@latest init

# Add required components
npx shadcn@latest add sidebar button input card avatar badge dropdown-menu separator breadcrumb sheet form label checkbox tooltip sonner

# Install additional deps
npm install @supabase/supabase-js @supabase/ssr zustand lucide-react date-fns

# Run dev server
npm run dev
```

## Environment Variables (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

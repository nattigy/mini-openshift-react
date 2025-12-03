# Mini OpenShift React UI

## Phase 1 - Setup & Infrastructure ✅ COMPLETE

This is a Next.js 14 React application for interacting with the Mini OpenShift FastAPI backend.

### Tech Stack
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API communication
- **js-cookie** - Cookie management for JWT tokens

### Project Structure
```
mini-openshift-react/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles & Tailwind
│   │   └── providers.tsx       # App providers & auth init
│   ├── components/             # Reusable components (Phase 2)
│   ├── lib/
│   │   └── utils.ts           # Helper utilities
│   ├── services/
│   │   └── api.ts             # API client with interceptors
│   ├── store/
│   │   └── authStore.ts       # Zustand auth store
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── middleware.ts           # Route protection
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── next.config.js
└── .env.local
```

---

## ✅ Completed in Phase 1

### 1. **Project Initialization**
- ✅ Next.js 15 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS with @tailwindcss/postcss
- ✅ ESLint configuration
- ✅ Build configuration
- ✅ Environment variables setup

### 2. **API Client Service** (`src/services/api.ts`)
- ✅ Centralized `APIClient` class
- ✅ Request interceptor: auto-injects JWT token from cookies
- ✅ Response interceptor: handles 401 errors and redirects to login
- ✅ Cookie-based token storage
- ✅ Pre-configured methods:
  - `login(email, password)` - OAuth2 token login
  - `getUsers(skip, limit)` - Fetch all users
  - `getCurrentUser()` - Fetch current authenticated user
  - `createUser(data)` - Create new user
  - `getProjects(skip, limit)` - Fetch all projects
  - `createProject(data)` - Create new project
  - `deleteProject(projectId)` - Delete project

### 3. **Authentication System** (`src/store/authStore.ts`)
- ✅ Zustand state management store
- ✅ Token persistence in cookies
- ✅ User object storage
- ✅ Loading and error states
- ✅ `setUser()` - Set current user
- ✅ `setToken()` - Set/remove token with cookie sync
- ✅ `logout()` - Clear auth state
- ✅ `initialize()` - Auto-load token on app start

### 4. **Route Protection** (`src/middleware.ts`)
- ✅ Protected routes: `/dashboard`, `/projects`, `/users`, `/settings`
- ✅ Auto-redirect unauthenticated users to `/login`
- ✅ Auto-redirect authenticated users away from `/login`
- ✅ Works with Next.js 15 middleware

### 5. **Styling Foundation** (`src/app/globals.css`)
- ✅ Tailwind CSS directives
- ✅ Reset styles
- ✅ Base typography
- ✅ Ready for component classes (badge, button, card, input, label)

### 6. **TypeScript Types** (`src/types/index.ts`)
- ✅ `User` interface
- ✅ `Project` interface
- ✅ `ApiError` interface
- ✅ `LoginResponse` interface

### 7. **Utilities** (`src/lib/utils.ts`)
- ✅ `formatDate()` - Format dates
- ✅ `formatDateTime()` - Format with time
- ✅ `truncate()` - Truncate strings
- ✅ `getInitials()` - Extract initials for avatars
- ✅ `cn()` - Combine class names

### 8. **App Providers** (`src/app/providers.tsx`)
- ✅ Auth initialization on app load
- ✅ Auto-fetch current user if token exists
- ✅ Error handling

---

## Getting Started

### Prerequisites
- Node.js 20+ (tested with Node 25)
- npm 10+ or yarn

### Installation
```bash
cd mini-openshift-react
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build & Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Configuration

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Adjust the `NEXT_PUBLIC_API_URL` if your FastAPI backend runs on a different host/port.

---

## API Integration

### Making API Requests
```typescript
import { apiClient } from '@/services/api';

// Login
const token = await apiClient.login('user@example.com', 'password');

// Get users
const users = await apiClient.getUsers(0, 100);

// Create project
const project = await apiClient.createProject({
  name: 'my-project',
  description: 'My first project'
});

// Delete project
await apiClient.deleteProject(projectId);
```

### Using Auth Store
```typescript
import { useAuthStore } from '@/store/authStore';

export function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div>
      {user && <p>Welcome, {user.username}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Build Verification

✅ **Build Status:** SUCCESS
- Compiled without errors
- Type checking passed
- Linting passed
- Output: `/out` (static export ready)

```
✓ Compiled successfully in 1017ms
✓ Linting and checking validity of types    
✓ Collecting page data    
✓ Generating static pages (4/4)
✓ Collecting build traces    
✓ Finalizing page optimization
```

---

## Next: Phase 2 - Components & UI

### Tasks for Phase 2:
1. Build reusable component library
   - Button components (primary, secondary, danger)
   - Card components
   - Form inputs and labels
   - Modal/Dialog components
   - Table components
   - Alert/Toast notifications
   - Loading states (spinners, skeletons)

2. Layout components
   - Sidebar navigation
   - Top navigation bar
   - Breadcrumbs
   - Footer

3. Authentication UI
   - Login page
   - Signup page
   - Logout confirmation

4. Dashboard
   - Overview/statistics
   - Recent projects
   - Recent users

---

## Project Statistics

- **Files Created:** 9 core files
- **Dependencies:** 5 main + dev dependencies
- **Lines of Code:** ~500 (excluding node_modules)
- **Build Time:** ~1 second
- **Bundle Size:** ~102 KB (First Load JS)

---

## Troubleshooting

### Build Errors
If you encounter build errors:
1. Clear `.next` folder: `rm -rf .next`
2. Clean cache: `npm cache clean --force`
3. Reinstall deps: `rm -rf node_modules package-lock.json && npm install`

### Environment Issues
- Ensure FastAPI backend is running on `http://localhost:8000`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Port Already in Use
If port 3000 is busy:
```bash
npm run dev -- -p 3001
```

---

## Status: ✅ Phase 1 Complete

**Ready for Phase 2: Component Library & UI**

All foundational infrastructure is in place:
- ✅ Next.js project configured
- ✅ API client ready
- ✅ Auth store ready  
- ✅ Route protection ready
- ✅ Build succeeds with no errors
- ✅ Ready to build components and pages


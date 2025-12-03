# Mini OpenShift - React Frontend

A modern, responsive web interface for the Mini OpenShift platform built with Next.js 15, React 18, and Tailwind CSS v4.

## Features

- 🎨 **Modern UI/UX**: Clean, responsive design with Tailwind CSS v4
- 🔐 **Authentication**: Secure login/signup with JWT tokens
- 👥 **User Management**: Admin dashboard for managing users
- 📦 **Project Management**: Create and manage Kubernetes-backed projects
- 🚀 **Deployment Management**: Deploy, scale, and monitor applications
- 🐳 **Pod Management**: Real-time pod monitoring with log viewing
- 🌙 **Dark Mode**: Theme switching support
- 🔔 **Notifications**: Toast notifications for user feedback
- 🔍 **Search & Pagination**: Efficient data browsing
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: JWT with cookies
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Running backend API (see [mini-openshift-fastapi](https://github.com/nattigy/mini-openshift-fastapi))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nattigy/mini-openshift-react.git
   cd mini-openshift-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Default Credentials

- **Email**: `test@example.com`
- **Password**: `password123`

## Project Structure

```
mini-openshift-react/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (dashboard)/        # Dashboard pages
│   │   ├── projects/           # Project-specific pages
│   │   ├── globals.css         # Global styles
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   ├── modals/             # Modal components
│   │   ├── pages/              # Page components
│   │   ├── Button.tsx          # UI components
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── services/               # API services
│   │   └── api.ts              # API client
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts
│   │   ├── notificationStore.ts
│   │   └── themeStore.ts
│   └── types/                  # TypeScript types
│       └── index.ts
├── public/                     # Static assets
├── docs/                       # Documentation
└── package.json
```

## Key Pages

### Authentication
- `/login` - User login
- `/signup` - User registration

### Dashboard
- `/dashboard` - Main dashboard overview
- `/users` - User management (admin only)
- `/projects` - Project listing
- `/settings` - User settings

### Project Pages
- `/projects/[projectId]/deployments` - Manage deployments
- `/projects/[projectId]/pods` - Monitor pods and view logs

## Features in Detail

### 🚀 Deployment Management
- Create new deployments with custom configurations
- Scale deployments up or down
- Monitor deployment status (Available/Progressing/Failed)
- Delete deployments
- Search and filter deployments

### 🐳 Pod Management
- Real-time pod status monitoring
- View pod logs with auto-refresh
- Delete pods
- Filter pods by status
- Container-level details

### 👥 User Management (Admin)
- Create new users
- Update user information
- Delete users
- Search users
- Role-based access control

### 📦 Project Management
- Create Kubernetes-backed projects
- Update project details
- Delete projects (removes K8s namespace)
- Search projects

## Styling

This project uses **Tailwind CSS v4** with the new `@import` and `@source` directives:

```css
@import "tailwindcss";
@source "../";
```

The configuration is minimal as Tailwind v4 uses auto-detection for content files.

## API Integration

The frontend communicates with the FastAPI backend through the API client located at `src/services/api.ts`. All requests include JWT authentication tokens stored in cookies.

### API Base URL
Set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## State Management

### Zustand Stores

- **authStore**: User authentication state
- **notificationStore**: Toast notifications
- **themeStore**: Dark/light theme preference

Example usage:
```typescript
import { useAuthStore } from '@/store/authStore';

const { user, login, logout } = useAuthStore();
```

## Components

### UI Components
- `Button` - Styled button with variants (primary, secondary, danger, ghost)
- `Card` - Container component with shadow
- `Input` - Form input with validation styles
- `Modal` - Reusable modal dialog
- `SearchBar` - Debounced search input
- `Pagination` - Page navigation
- `NotificationCenter` - Toast notifications

### Layout Components
- `Header` - Top navigation bar
- `Sidebar` - Side navigation menu
- `DashboardLayout` - Main layout wrapper

## TypeScript Types

All API responses and data structures are fully typed. See `src/types/index.ts` for:
- `User`
- `Project`
- `Deployment`
- `Pod`
- `ContainerStatus`
- And more...

## Development Tips

### Adding a New Page
1. Create page in `src/app/` directory
2. Use `"use client"` directive if using hooks
3. Wrap with `DashboardLayout` if needed
4. Add route to sidebar navigation

### Creating a New Component
1. Add component to `src/components/`
2. Export from `src/components/index.ts`
3. Use TypeScript for props
4. Follow existing naming conventions

### API Calls
Use the centralized API client:
```typescript
import { apiClient } from '@/services/api';

const projects = await apiClient.getProjects();
```

## Troubleshooting

### Styles Not Loading
If Tailwind classes aren't applying:
1. Clear `.next` cache: `rm -rf .next`
2. Restart dev server: `npm run dev`

### API Connection Issues
Ensure:
1. Backend is running on `http://localhost:8000`
2. `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. CORS is enabled in backend

## Documentation

- [Frontend Integration Walkthrough](docs/frontend_integration_walkthrough.md)
- [Project Summary](PROJECT_SUMMARY.md)
- [Features List](FEATURES.md)

## Production Build

```bash
npm run build
npm start
```

The optimized production build will be available at `http://localhost:3000`.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Projects

- [Backend API](https://github.com/nattigy/mini-openshift-fastapi) - FastAPI backend with Kubernetes integration

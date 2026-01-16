# SoloLevel AI Assistant

A mobile-first, gamified personal AI assistant and routine manager with XP/level system. Transform your daily routines into achievements with smart task management, progress tracking, and AI-powered suggestions.

## 🎮 Features

- **Virtual AI Assistant** - Interactive chatbot with voice input/output
- **Task Management** - Create, track, and complete tasks
- **Day Planning** - Schedule tasks for upcoming days
- **XP & Level System** - Gamified progress tracking
- **Dashboard Analytics** - View stats by day/week/month/year
- **Mobile-First Design** - Responsive UI optimized for mobile

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query (React Query)
- **Animations**: Tailwind CSS Animate
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── tooltip.tsx
│   ├── AuthModal.tsx          # Login/Signup modal component
│   ├── BottomNav.tsx          # Mobile bottom navigation bar
│   └── TopBar.tsx             # Top navigation with auth dropdown
│
├── pages/
│   ├── Landing.tsx            # Home/landing page with hero section
│   ├── Assistant.tsx          # Virtual AI assistant with voice input
│   ├── Planning.tsx           # Schedule tasks for future days
│   ├── Tasks.tsx              # View and manage all tasks
│   ├── Dashboard.tsx          # Stats, XP, level, analytics
│   ├── Index.tsx              # Index redirect
│   └── NotFound.tsx           # 404 page
│
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
│
├── lib/
│   └── utils.ts               # Utility functions (cn, etc.)
│
├── App.tsx                    # Main app with routing
├── App.css                    # Global app styles
├── index.css                  # Tailwind + CSS variables (design system)
├── main.tsx                   # React entry point
└── vite-env.d.ts              # Vite type definitions

public/
├── favicon.ico
├── placeholder.svg
└── robots.txt

Configuration Files:
├── index.html                 # HTML template
├── tailwind.config.ts         # Tailwind configuration + custom theme
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── components.json            # shadcn/ui configuration
├── eslint.config.js           # ESLint configuration
└── package.json               # Dependencies and scripts
```

## 🎨 Design System

The app uses a custom design system with CSS variables defined in `src/index.css`:

### Colors (HSL Format)
- **Primary**: Purple gradient (`hsl(262 83% 58%)`)
- **Secondary**: Blue (`hsl(220 90% 56%)`)
- **Accent**: Teal (`hsl(180 100% 45%)`)
- **Success**: Green (`hsl(142 76% 36%)`)
- **Warning**: Orange (`hsl(38 92% 50%)`)
- **XP**: Gold (`hsl(45 100% 50%)`)

### Gradients
- `--gradient-primary`: Purple to Blue
- `--gradient-success`: Green variations
- `--gradient-hero`: Purple → Blue → Teal

### Shadows
- `--shadow-glow`: Glowing effect for interactive elements

## 📱 Pages Overview

### 1. Landing Page (`/`)
- Hero section with app description
- "Let's Go" CTA opens auth modal
- Feature cards showcasing app capabilities

### 2. Assistant Page (`/assistant`)
- Virtual AI avatar (animated, draggable)
- Expandable text input with embedded mic
- Voice control button for speech input

### 3. Planning Page (`/planning`)
- Date picker for scheduling
- Add tasks with title, time, category, XP reward
- View tasks scheduled for selected date

### 4. Tasks Page (`/tasks`)
- Quick task addition
- Filter by: All / Active / Completed
- Toggle completion, delete tasks
- XP tracking for completed tasks

### 5. Dashboard Page (`/dashboard`)
- Level & XP progress bar
- Stats cards (Focus, Health, Creativity)
- Time range tabs: Day / Week / Month / Year
- Task completion metrics and trends

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## 🔮 Future Enhancements

- [ ] **Backend Integration** - Connect to Lovable Cloud for data persistence
- [ ] **User Authentication** - Email/password and social login
- [ ] **AI Integration** - Connect to Gemini/ChatGPT for smart suggestions
- [ ] **Push Notifications** - Browser notifications for reminders
- [ ] **Settings Page** - User preferences, language selection
- [ ] **Achievements System** - Badges and milestones
- [ ] **Admin Panel** - User management and analytics

## 🔗 Links

- **Lovable Project**: https://lovable.dev/projects/fc9c4a73-1615-4f61-bc61-44ce43c048f6
- **Documentation**: https://docs.lovable.dev

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using [Lovable](https://lovable.dev)

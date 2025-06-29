# Elevatr Career Success Tracker

A comprehensive Next.js PWA for tracking career growth through structured 15-day and 30-day sprints. Build better habits, achieve your career goals, and track your progress with data-driven insights, intelligent features, and a beautiful, modern UI.

![Elevatr Career Success Tracker](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Elevatr+Career+Success+Tracker)

## ✨ Features

### 🤖 Intelligent Features
- **Optimistic UI**: Instant feedback for all actions, with background sync and rollback on errors
- **Intelligent Caching**: Dual-layer (memory + localStorage) cache, auto-refresh, and manual invalidation
- **Navigation Preloading**: Aggressive and predictive route preloading based on user behavior and idle time
- **Persistent Navigation State**: Remembers navigation and restores state across sessions and devices
- **Smart Notifications**: Context-aware reminders, milestone alerts, and achievement encouragement
- **Sync Progress Indicator**: Real-time sync status, error handling, and retry logic
- **Error Handling System**: Automatic retry, exponential backoff, and user-friendly error messages
- **Background Synchronization**: All changes sync to Firebase in the background, with offline support
- **Auto-Save**: Journal and task data are auto-saved with visual feedback and error recovery
- **Performance Monitoring**: Real-time metrics, cache hit rates, and sync status indicators
- **Adaptive UI**: Responsive design, touch targets, and reduced effects for mobile/performance
- **Session-Aware PWA**: Install prompts, app shortcuts, and offline-first experience
- **Data Migration**: Seamless upgrades with no data loss, local/cloud sync transitions
- **Future-Ready**: Modular for AI-powered suggestions, analytics, and integrations

### 🚀 Core Features
- **Sprint Management**: Create, view, edit, and delete 15/30-day sprints
- **Task Management**: Priority-based, category-filtered, with instant optimistic updates
- **Daily Journaling**: Rich text, sprint-linked, with auto-save and reflection prompts
- **Progress Analytics**: Streaks, completion rates, visual charts, and goal metrics
- **Calendar View**: Visualize sprints, tasks, and milestones
- **User Profiles**: Firebase Auth, profile customization, settings, and theme
- **Smart Notifications**: Task reminders, milestone alerts, and achievement celebrations
- **PWA**: Offline support, install prompts, app shortcuts, persistent navigation state
- **Optimistic UI**: Instant feedback, background sync, error rollback
- **Intelligent Caching**: Local cache, auto-refresh, manual invalidation
- **Modern UI/UX**: 100% theme coverage (glassmorphism, gradients, animations)
- **Accessibility**: High contrast, keyboard navigation, responsive design
- **Robust Error Handling**: Comprehensive error boundaries and user feedback
- **Type Safety**: Full TypeScript, strict mode
- **Performance**: Fast navigation, preloading, efficient data fetching
- **Sync Progress Indicator**: Real-time sync status, error handling, and retry logic
- **Enhanced Navigation**: Preloading, persistent state, route caching, FastLink, NavigationProgress
- **Performance Monitoring**: OptimisticStateIndicator, PerformanceIndicator, cache hit rates
- **Comprehensive API Layer**: Sprint, Task, Journal, Progress, Template APIs
- **Modular State Management**: Zustand stores for sprints, tasks, progress, and app state
- **Error Handling System**: ErrorProvider, ErrorNotification, useErrorHandler hook
- **Settings Page Enhancements**: Local/cloud storage info, sync upgrade prompts
- **Mobile-First Design**: Touch targets, hamburger menu, mobile performance optimizations
- **Testing & Validation**: Type checks, linting, manual QA, error prevention

### 🗂️ Main Application Pages
- **🏠 Dashboard**: Overview, quick actions, stats, and recent activity
- **🏃‍♂️ Sprint Management**: List, create, and manage sprints
- **📋 Sprint Details**: View and update individual sprints
- **✅ Tasks**: Manage all tasks, filter, and update instantly
- **📖 Journal**: Daily entries, progress reflection, and insights
- **📅 Calendar**: Timeline of sprints and tasks
- **📊 Progress**: Analytics, streaks, and performance trends
- **⚙️ Settings**: User preferences, theme, and notifications
- **📤 Upload**: Data import/export (NEW)

### 🎨 UI & Theme System
- **Glassmorphism**: Translucent cards, backdrop blur, and gradients
- **Consistent Design**: Unified color palette, spacing, and typography
- **Smooth Animations**: Staggered entrances, hover/focus effects
- **Responsive**: Mobile, tablet, and desktop optimized
- **Accessible**: Proper contrast, focus indicators, and ARIA support
- **Component Library**: ElevatrCard, ElevatrButton, ElevatrBadge, ElevatrSprintCard, ElevatrJournalCard, ElevatrNotification, SyncIndicator, ErrorNotification, FastLink, NavigationProgress, PWAInstallPrompt, LoadingSpinner, Progress, PerformanceIndicator, OptimisticStateIndicator

### ⚡ State Management & Performance
- **Optimistic Updates**: UI updates before server confirmation
- **Background Sync**: All changes sync to Firebase in background
- **Intelligent Caching**: Local storage, auto-refresh, and manual invalidation
- **Persistent Navigation**: State saved across sessions
- **Preloading**: Fast route changes and app-like experience
- **Route Caching**: useNavigationCache hook, dual-layer cache, expiration
- **Performance Monitoring**: Real-time metrics, cache hits, sync status

### 🛡️ Security & Reliability
- **Comprehensive Error Handling**: All Firebase operations covered
- **Type Safety**: Strict TypeScript everywhere
- **Testing**: Linting, type checks, and manual QA
- **Input Validation**: Consistent validation patterns
- **Rollback Mechanisms**: For failed operations

### 🔧 Advanced & Optional Features
- **Local Storage Service**: For unauthenticated users
- **Data Sync Service**: Seamless upgrade to cloud sync
- **Enhanced AuthContext**: Optional authentication flows
- **Manual/Auto Save**: For journal and tasks
- **Migration Notes**: No data loss on upgrades
- **Future-Ready**: Modular for AI, team, and integration features

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Custom UI Component Library**
- **Lucide React** (icons)
- **date-fns** (date utilities)

### Backend & Database
- **Firebase**: Auth, Firestore, Storage
- **Vercel**: Hosting

### Dev Tools
- **ESLint**, **Prettier**, **Turbopack**

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elevatr.git
   cd elevatr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Add your Firebase configuration to `.env.local`

## 📱 Usage Guide

### Creating Your First Sprint

1. **Sign up/Login** to your account
2. **Navigate to Dashboard** and click "Create New Sprint"
3. **Choose sprint duration** (15 or 30 days)
4. **Set your sprint goal** with title and description
5. **Add daily tasks** for each day of the sprint
6. **Start your sprint** and begin tracking progress

### Daily Workflow

1. **Check your dashboard** for today's tasks
2. **Complete core tasks** first for maximum impact
3. **Work on special tasks** when time permits
4. **Update task status** as you complete them
5. **Write journal entries** to reflect on progress
6. **Review analytics** to stay motivated

### Progress Tracking

- **Visit Progress page** for detailed analytics
- **Review completion rates** and streaks
- **Analyze daily activity** charts
- **Celebrate achievements** and milestones
- **Adjust strategies** based on insights

## 🗂️ Project Structure

```
elevatr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard page
│   │   ├── sprint/            # Sprint management
│   │   ├── tasks/             # Task management
│   │   ├── progress/          # Analytics & progress
│   │   ├── journal/           # Daily journal
│   │   ├── calendar/          # Calendar view
│   │   ├── settings/          # User settings
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components
│   │   ├── sprint/            # Sprint-related components
│   │   └── ui/                # UI components
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── NotificationContext.tsx # Notification system
│   ├── services/              # External services
│   │   └── firebase.ts        # Firebase integration
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts           # Type definitions
│   └── lib/                   # Utility functions
│       └── utils.ts           # Helper functions
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── README.md                  # Project documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📈 Performance

- **Fast initial load** with Next.js optimization
- **Efficient data fetching** with Firebase SDK
- **Responsive design** for all screen sizes
- **Progressive Web App** features (planned)
- **Offline support** (planned)

## 🔮 Roadmap

### Phase 1 - Foundation ✅
- [x] User authentication and profiles
- [x] Sprint creation and management
- [x] Task tracking and completion
- [x] Basic analytics and progress tracking
- [x] Daily journaling features

### Phase 2 - Enhancement 📋
- [ ] Sprint templates marketplace
- [ ] Team collaboration features
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Email notifications and reminders

### Phase 3 - Scale 🔮
- [ ] AI-powered goal recommendations
- [ ] Integration with external tools (GitHub, LinkedIn, etc.)
- [ ] Mentorship and coaching features
- [ ] Corporate team management
- [ ] Advanced reporting and exports

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for backend infrastructure
- **Next.js team** for the amazing framework
- **Tailwind CSS** for the design system
- **Lucide** for beautiful icons
- **Open source community** for inspiration and tools

## 📞 Support

- **Documentation**: [docs.elevatr.app](https://docs.elevatr.app) (coming soon)
- **Issues**: [GitHub Issues](https://github.com/yourusername/elevatr/issues)
- **Email**: support@elevatr.app
- **Discord**: [Join our community](https://discord.gg/elevatr) (coming soon)

---

**Built with ❤️ for career growth and professional development**

*Elevatr - Elevate your career, one sprint at a time.*

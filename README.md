# Elevatr Career Success Tracker

A comprehensive Next.js application for tracking career growth through structured 15-day and 30-day sprints. Build better habits, achieve your career goals, and track your progress with data-driven insights.

![Elevatr Career Success Tracker](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Elevatr+Career+Success+Tracker)

## ✨ Features

### 🎯 Sprint Management
- **15-day and 30-day career sprints** with structured daily tasks
- **Core tasks** for skill development and career advancement
- **Special tasks** for additional growth opportunities
- **Sprint templates** for common career goals
- **Progress tracking** and completion analytics

### 📊 Progress Analytics
- **Daily activity visualization** with interactive charts
- **Completion rate tracking** across all sprints
- **Streak tracking** to maintain momentum
- **Performance insights** and trends analysis
- **Goal achievement metrics**

### ✅ Task Management
- **Priority-based task organization** (High, Medium, Low)
- **Category-based filtering** for better organization
- **Due date management** with deadline tracking
- **Task completion tracking** with timestamps
- **Status management** (Active, Completed, Blocked)

### 📝 Daily Journal
- **Reflection prompts** for continuous improvement
- **Day-specific entries** linked to sprint progress
- **Progress documentation** and insights capture
- **Achievement celebration** and learning capture

### 🗓️ Calendar Integration
- **Visual sprint timeline** with monthly/weekly views
- **Task deadline visualization**
- **Sprint milestone tracking**
- **Progress heat map** for daily activity

### 👤 User Management
- **Firebase Authentication** with email/password
- **Profile customization** with display name and preferences
- **Settings management** for notifications and themes
- **Dark/Light theme** support with system preference detection

### 🔔 Smart Notifications
- **Task reminders** with customizable timing
- **Sprint milestone notifications**
- **Achievement celebrations**
- **Progress insights** and encouragement

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation and formatting

### Backend & Database
- **Firebase** - Backend-as-a-Service
  - Authentication
  - Firestore Database
  - Cloud Storage (for future features)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Turbopack** - Fast bundler for development

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

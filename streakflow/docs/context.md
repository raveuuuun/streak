# Streakflow – Simplified App Flow & Features

Streakflow is a lightweight productivity app that helps users stay consistent with their daily, weekly, and monthly goals. It runs fully **locally**, with **no database**, no cloud sync, and no backend complexity.

This document provides a **clean, brief, developer-friendly** description of the app.

---
## Tech Stack
Frontend: React Native avec TypeScript, Expo et Expo Router
Backend/Base de données: Supabase
Framework UI: React Native Paper
Traitement IA: DeepSeek

---

## Project Structure

```
streak/
├── .expo/                          # Expo build cache and config
├── .gitignore                      # Git ignore rules
├── app.json                        # Expo app configuration
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── app/                            # Expo Router app directory
│   ├── _layout.tsx                 # Root layout with navigation
│   ├── (auth)/                     # Auth group routes
│   │   ├── _layout.tsx             # Auth layout
│   │   ├── welcome.tsx             # Welcome screen
│   │   ├── login.tsx               # Login screen
│   │   └── signup.tsx              # Sign up screen
│   ├── (tabs)/                     # Main app tabs group
│   │   ├── _layout.tsx             # Tab navigation layout
│   │   ├── index.tsx               # Dashboard (home tab)
│   │   ├── goals.tsx               # Goals list screen
│   │   ├── focus.tsx               # Focus mode screen
│   │   └── settings.tsx            # Settings screen
│   ├── goal/                       # Goal detail routes
│   │   ├── [id].tsx                # Goal detail/edit screen
│   │   └── create.tsx              # Create new goal
│   ├── focus/                      # Focus mode routes
│   │   ├── [goalId].tsx            # Active focus session
│   │   └── complete.tsx            # Focus session completion
│   └── ai/                         # AI features routes
│       ├── chat.tsx                # AI chat interface
│       └── suggestions.tsx         # AI suggestions
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalList.tsx
│   │   │   ├── GoalForm.tsx
│   │   │   └── StreakBadge.tsx
│   │   ├── focus/
│   │   │   ├── FocusTimer.tsx
│   │   │   ├── FocusSession.tsx
│   │   │   └── SessionComplete.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── QuickAdd.tsx
│   │   │   ├── StreakOverview.tsx
│   │   │   └── GoalSection.tsx
│   │   └── ai/
│   │       ├── AIChat.tsx
│   │       ├── AIMessage.tsx
│   │       └── AISuggestions.tsx
│   ├── lib/                        # Core utilities and services
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase client setup
│   │   │   ├── auth.ts             # Auth helpers
│   │   │   └── types.ts            # Database types
│   │   ├── storage/
│   │   │   ├── localStorage.ts     # Local storage helpers
│   │   │   └── cache.ts            # Cache management
│   │   ├── ai/
│   │   │   ├── deepseek.ts         # DeepSeek API client
│   │   │   ├── prompts.ts          # AI prompt templates
│   │   │   └── suggestions.ts      # AI suggestion logic
│   │   ├── notifications/
│   │   │   ├── scheduler.ts        # Notification scheduling
│   │   │   └── handlers.ts         # Notification handlers
│   │   └── utils/
│   │       ├── date.ts             # Date utilities
│   │       ├── streak.ts           # Streak calculation logic
│   │       └── validation.ts       # Form validation
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useGoals.ts             # Goals management hook
│   │   ├── useStreaks.ts           # Streak tracking hook
│   │   ├── useFocus.ts             # Focus mode hook
│   │   ├── useAI.ts                # AI features hook
│   │   └── useNotifications.ts     # Notifications hook
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.tsx         # Auth state management
│   │   ├── GoalsContext.tsx        # Goals state management
│   │   ├── ThemeContext.tsx        # Theme (light/dark) context
│   │   └── NotificationContext.tsx # Notification context
│   ├── types/                      # TypeScript type definitions
│   │   ├── goal.ts                 # Goal types
│   │   ├── user.ts                 # User types
│   │   ├── streak.ts               # Streak types
│   │   ├── focus.ts                # Focus session types
│   │   └── ai.ts                   # AI types
│   └── constants/                  # App constants
│       ├── colors.ts               # Color palette
│       ├── spacing.ts              # Spacing values
│       └── config.ts               # App configuration
├── assets/                         # Static assets
│   ├── images/                     # Image files
│   ├── fonts/                      # Custom fonts
│   └── icons/                      # Icon files
├── docs/                           # Documentation
│   └── context.md                  # This file
└── README.md                       # Project README
```

---

## 1. Authentication

### 1.1 Welcome Screen

- Minimal UI
- Buttons: **Login** / **Sign Up** via email

### 1.2 Login / Sign Up

- Simple local credential storage (or skip persistent auth entirely)
- After login → go directly to **Dashboard**

---

## 2. Dashboard

The main hub where the user sees their goals and streaks.

### 2.1 Sections

- **Daily Goals**
- **Weekly Goals**
- **Monthly Goals**
- **Streak Overview** (local counters)

### 2.2 Quick Add

- Fast entry for any type of goal
- Optional: Add using a short AI chat prompt

---

## 3. Goal Management

### 3.1 Creating a Goal

- Choose type: Daily / Weekly / Monthly
- Enter name
- Optional description

### 3.2 Editing

- Edit or delete goals locally

### 3.3 Completion

- Checking a goal updates streak counters

---

## 4. Focus Mode

A clean mode to help users work on one task at a time.

### 4.1 Starting Focus Mode

- Select a goal → tap **Focus**

### 4.2 During Focus

- Timer displayed
- Minimal UI (task + timer)
- Optional: Block in-app notifications

### 4.3 Finishing a Session

- Show time spent
- Update streaks
- Option to continue or take a break

---

## 5. AI Features (Local / Lightweight)

### 5.1 AI Streak

- Simple AI-generated motivational messages
- Suggest which goal to prioritize

### 5.2 AI Agent Mode

A small chat-like interface where the AI can:

- Suggest goals
- Break a goal into steps
- Recommend focus sessions

(No backend; AI only uses local context.)

---

## 6. Notifications

(Local only, no server push.)

- Reminders for daily goals
- Streak warnings ("You're close to breaking your streak!")
- Optional focus reminders

---

## 7. Settings

- Light / dark mode
- Notification toggle
- AI toggle
- Reset all local data

---

## 8. User Flow Summary

1. User opens app → clean welcome screen
2. Logs in locally
3. Dashboard shows goals + streaks
4. User adds goals
5. Starts Focus Mode to work
6. Streaks update based on completion
7. Optional: AI provides simple guidance

---

## 9. Development Notes

- Entirely local storage (AsyncStorage or similar)
- No backend logic
- Keep UI minimal
- Fast transitions and simple navigation
- Streak system should react instantly

---

This simplified specification is designed for a fast, clean implementation of Streakflow with minimal complexity and no external services.


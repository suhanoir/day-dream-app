# 🌟 BucketList v1.3.2 — Full-Stack Web Application

> **Version 1.3.2** · **"Make memories worth remembering."**

A production-quality, responsive Full-Stack web application combining lifelong aspirations, calendar planning, and daily task execution into a single unified personal hub. Designed with a calm, minimal, and warm aesthetic.

Live on Vercel: **[https://bucket-list-app-two.vercel.app](https://bucket-list-app-two.vercel.app)**

---

## 🧭 The Three Core Sections

| Section | Route | Core Purpose | User Mindset |
| :--- | :--- | :--- | :--- |
| **1. Dashboard** | `/dashboard` | Long-term bucket-list goals, custom categories, milestones, and personal memory reflections. | *"What do I want to accomplish in life?"* |
| **2. Calendar** | `/calendar` | Upcoming events, schedules, important dates, and goal target dates with month/week/agenda views. | *"What is coming up?"* |
| **3. To-Do List** | `/todo` | Daily actionable tasks with date isolation, ultra-fast inline entry, always-visible checkboxes, and celebration. | *"What do I need to get done today?"* |

---

## ✨ Features

### 1. Dashboard — Long-Term Bucket List Goals
- **Clean Task View**: Goals display **only** the title by default without distracting checkboxes.
- **Milestone Detail Modal**: Clicking a goal reveals the reflection journal, target dates, completion status, and quick-actions:
  - **Schedule on Calendar**: Pre-fills the goal onto the calendar.
  - **Add to To-Do List**: Converts an aspiration into a daily actionable task.
- **Celebration & Memories**: Completing a goal fires celebratory confetti and permanently unlocks the reflection journal.
- **Custom Categories**: Built-in starter categories (Travel, Experiences, Life, Skills, Career, Fitness, Money, Personal) plus full custom category CRUD.
- **Live Statistics**: Total goals, completed count, remaining count, and overall progress percentage.
- **Search & Filtering**: Real-time title search, category filter, and status tabs (`All`, `Active`, `Completed`).

### 2. Calendar — Upcoming Events & Schedules
- **Multiple Views**: Interactive **Month Grid**, **Week View**, and chronological **Agenda View**.
- **Event Management**: Create and edit events with Title, Date, Start/End times, Location, Reminder preference, and color-coded Categories.
- **Today's Schedule & Upcoming List**: Side panel displaying today's agenda or upcoming dates.
- **Bucket List Linkage**: Milestone events linked back to original goals.

### 3. To-Do List — Daily Task Execution
- **Strict Date Isolation**: Tasks are assigned strictly to specific dates (`← Previous Day`, `Today`, `Next Day →`) and never bleed across days.
- **Ultra-Fast Inline Entry**: Simple `+ Add a task...` input — type and press `Enter` to create tasks immediately without modal friction.
- **Always-Visible Checkboxes**: Checkbox is always visible. Ticking applies smooth strikethrough styling and moves tasks to a collapsible `COMPLETED` section.
- **Daily Progress & Confetti**: Tracks daily progress (`3 / 5 completed · 60%`). Triggers confetti and displays *"Everything is done! You completed everything on your list today."* when all daily tasks are done.
- **Task Details**: Set or edit Description, Due Time (e.g. `5:00 PM`), Priority (`Low`, `Medium`, `High`), and Category (`Personal`, `College`, `Work`, `Health`, `Study`, `Other`).
- **Overdue Task Helper**: Unfinished tasks from past days remain on their date with a 1-click **"Move to Today"** button.
- **Schedule Integration**: Displays today's scheduled calendar events above the task list for seamless daily planning.

### 4. Security & Account Management
- **Authentication**: Email/password authentication with `bcryptjs` hashing (10 rounds).
- **Session Security**: Stateless, secure `HttpOnly` JWT cookies verified on every request.
- **User Isolation**: Strict server-side `userId` scoping on all Prisma queries and mutations.
- **Profile Modal**: In-app profile overview showing account creation date, goal/event/task stats, and sign out.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend**: Next.js Route Handlers (`app/api/...`), Jose (JWT), Bcrypt.js
- **Database & ORM**: PostgreSQL (hosted on Neon Serverless) with Prisma ORM 6.4.1
- **Deployment**: Vercel CI/CD with automatic branch deployments

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** >= 18.x (tested on Node v24)
- **npm** or **pnpm** / **yarn**

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/suhanoir/bucket-list-app.git
cd bucket-list-app

# Install dependencies
npm install

# Push database schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_secure_jwt_secret_key_here"
NODE_ENV="development"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Windows 1-Click Launch**: Double-click `Launch-BucketList.bat` in the root folder to start the local server and open the app in a dedicated window.

---

## 📂 Project Structure

```text
BucketList/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login page
│   │   └── register/page.tsx        # Registration page
│   ├── api/
│   │   ├── auth/                    # Register, Login, Logout, Session check
│   │   ├── categories/              # Category CRUD endpoints
│   │   ├── bucket-list/             # Goal CRUD, complete status, reflection
│   │   ├── events/                  # Calendar event CRUD endpoints
│   │   ├── todos/                   # To-Do task CRUD, complete, move-today endpoints
│   │   └── stats/                   # Real-time statistics endpoint
│   ├── dashboard/page.tsx           # Section 1: Bucket List Dashboard
│   ├── calendar/page.tsx            # Section 2: Upcoming Events Calendar
│   ├── todo/page.tsx                # Section 3: Daily To-Do List (/todo, /to-do-list)
│   ├── to-do-list/page.tsx          # Route alias for /to-do-list
│   ├── globals.css                  # Tailwind styles & custom animations
│   ├── layout.tsx                   # App Root Layout with providers
│   └── page.tsx                     # Landing page
├── components/
│   ├── auth/                        # LoginForm, RegisterForm
│   ├── bucket-list/                 # BucketListItemCard, DetailModal, Add/EditModals
│   ├── calendar/                    # MonthView, WeekView, AgendaView, Event Modals
│   ├── categories/                  # CategorySection, Add/EditCategoryModals
│   ├── dashboard/                   # DashboardHeader, StatsOverview, FilterBar
│   ├── todo/                        # QuickAddTaskInput, TodoTaskItem, DetailModal, DateNavigator
│   ├── profile/                     # ProfileModal with user account statistics
│   ├── providers/                   # AuthProvider, ToastProvider
│   └── ui/                          # Button, Input, Textarea, Modal, ConfirmDialog
├── lib/
│   ├── auth/                        # JWT & Session verification utilities
│   ├── db/                          # Prisma Client singleton
│   ├── default-categories.ts        # Starter category templates
│   └── utils/                       # cn helper
├── prisma/
│   └── schema.prisma                # PostgreSQL schema: User, Category, BucketListItem, Event, TodoTask
├── Launch-BucketList.bat            # Windows 1-click desktop launcher
├── package.json                     # v1.3.2 dependencies and scripts
└── README.md
```

---

## 🔒 Security & Data Privacy

- Passwords hashed with 10 salt rounds using `bcryptjs`.
- Session tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- All database queries and mutations enforce `where: { userId: session.userId }` preventing cross-user data access.
- Strict input validation and sanitization on all API routes.

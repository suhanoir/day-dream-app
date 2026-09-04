# 🌟 BucketList — Full-Stack Web Application

> **"Make memories worth remembering."**

A production-quality, responsive Full-Stack Bucket List web application designed with a calm, minimal, and personal aesthetic. It allows users to track their lifelong aspirations, organize them into custom categories, complete milestones, and preserve personal reflections for their future selves.

---

## ✨ Features

- **🔐 Secure Authentication**:
  - Email and password registration & login with `bcryptjs` password hashing.
  - Secure, `HttpOnly` JWT session cookies (via `jose`).
  - Automatic seeding of default starter categories upon registration.
  - Strict user-level data isolation.

- **🗂️ Category-Based Organization**:
  - Built-in categories (Travel, Experiences, Life, Skills, Career, Fitness, Money, Personal) + Full custom category CRUD.
  - Visual category sections on a unified dashboard with individual category progress bars (`3 / 8 completed`).

- **✨ Clean Task View & Completion Flow (Dashboard)**:
  - **Default Dashboard State**: Items display **only** the goal name without initial checkboxes.
  - **Clicking an Item**: Opens the rich detail modal with completion controls, milestone timestamps, reflection notes, and options to Schedule on Calendar or Add to To-Do List.
  - **Celebration & Reflection**: Completing a goal triggers a celebratory confetti effect and unlocks a permanent reflection journal.
  - **Reflections & Memories**: Saved reflections are permanently preserved and editable at any time.

- **📅 Upcoming Events Calendar (Section 2)**:
  - Dedicated `/calendar` section for scheduling events, milestone target dates, and plans.
  - Month, Week, and Agenda views with date navigation, event filtering, and color-coded categories.
  - Displays "Today's Schedule" and upcoming events.

- **✅ To-Do List (Section 3)**:
  - Dedicated `/todo` (and `/to-do-list`) daily task management section.
  - Always-visible checkboxes, inline rapid task creation (`+ Add a task...` -> `Enter`), and strike-through styling.
  - Daily date navigation (`← Previous Day`, `Today`, `Next Day →`) with strict date isolation.
  - Daily progress tracking with confetti celebration when all tasks are complete.
  - Task priority (`Low`, `Medium`, `High`), categories, due times, and overdue task helper ("Move to Today").
  - Seamless integration: view today's calendar events at a glance and add bucket-list goals as daily to-do tasks.

- **📊 Dashboard Statistics**:
  - Live counts: **Total Goals**, **Completed**, **Remaining**, and **Overall Progress %** with an animated progress bar.
  - Updates automatically in real-time.

- **🔍 Search & Filtering**:
  - Instant text search across goal titles, descriptions, and reflections.
  - Quick status tabs: `[ All ]`, `[ Active ]`, `[ Completed ]`.
  - Category dropdown filter.

- **📱 Responsive & Accessible UI**:
  - Optimized for desktop, laptop, tablet, and mobile with touch-friendly controls.
  - Warm neutral theme with generous whitespace and elegant typography.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend**: Next.js Route Handlers (`app/api/...`), Jose (JWT), Bcrypt.js
- **Database & ORM**: SQLite (default zero-config file database) with Prisma ORM (easily switchable to PostgreSQL)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** >= 18.x (tested on Node v24)
- **npm** or **yarn** / **pnpm**

### 2. Installation & Setup

```bash
# Clone or navigate to the project directory
cd BucketList

# Install dependencies
npm install

# Initialize database schema and generate Prisma client
npx prisma db push

# Optional: Seed sample goals and demo account
node scripts/seed-demo.mjs
```

### 3. Environment Variables

Create or verify `.env` in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="bucket_list_super_secret_jwt_key_2026_modern_secure_token"
NODE_ENV="development"
```

> **Switching to PostgreSQL**: Simply replace `provider = "sqlite"` with `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL` in `.env` (e.g. `postgresql://user:password@localhost:5432/bucketlist`).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Demo Credentials

For quick testing without creating a new email:
- **Email**: `demo@bucketlist.com`
- **Password**: `password123`
- *(Or click the "Try with 1-Click Demo Account" button on the login screen)*

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
│   │   ├── bucket-list/             # Item CRUD, complete status, reflection
│   │   ├── events/                  # Calendar event CRUD endpoints
│   │   ├── todos/                   # To-Do task CRUD & complete endpoints
│   │   └── stats/                   # Real-time statistics endpoint
│   ├── calendar/page.tsx            # Section 2: Upcoming Events Calendar
│   ├── dashboard/page.tsx           # Section 1: Bucket List Dashboard
│   ├── todo/page.tsx                # Section 3: Daily To-Do List (/todo, /to-do-list)
│   ├── globals.css                  # Tailwind styles & animations
│   ├── layout.tsx                   # App Root Layout with providers
│   └── page.tsx                     # Landing page
├── components/
│   ├── auth/                        # LoginForm, RegisterForm
│   ├── bucket-list/                 # BucketListItemCard, DetailModal, Add/EditModals
│   ├── calendar/                    # MonthView, WeekView, AgendaView, Event Modals
│   ├── categories/                  # CategorySection, Add/EditCategoryModals
│   ├── dashboard/                   # DashboardHeader, StatsOverview, FilterBar, EmptyState
│   ├── todo/                        # QuickAddTaskInput, TodoTaskItem, DetailModal, DateNavigator
│   ├── providers/                   # AuthProvider, ToastProvider
│   └── ui/                          # Button, Input, Textarea, Modal, ConfirmDialog, ProgressBar
├── lib/
│   ├── auth/                        # JWT & Session verification utilities
│   ├── db/                          # Prisma Client singleton
│   ├── default-categories.ts        # Starter category templates
│   └── utils/                       # cn helper
├── prisma/
│   └── schema.prisma                # Prisma schema for User, Category, BucketListItem, Event, TodoTask
├── scripts/
│   ├── seed-demo.mjs                # Demo dataset seed script
│   └── verify-api.mjs               # Verification script for database & isolation
├── .env.example
├── package.json
└── README.md
```

---

## 🔒 Security & Data Privacy

- Passwords hashed with 10 salt rounds using `bcryptjs`.
- Session tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- All database queries and mutations enforce `where: { userId: session.userId }` preventing cross-user data leakage.
- Clean error messaging without exposing raw database errors or stack traces.


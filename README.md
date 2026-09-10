# 🌟 DayDream v2.7.1 — Full-Stack Web Application

> **Version 2.7.1** · **"Make memories worth remembering."**

A production-quality, responsive Full-Stack web application combining lifelong aspirations, calendar planning, daily task execution, and monthly expense tracking into a single unified personal hub. Designed with a calm, minimal, and warm aesthetic.

Repository: **[https://github.com/suhanoir/day-dream-app.git](https://github.com/suhanoir/day-dream-app.git)**  
Live on Vercel: **[https://bucket-list-app-two.vercel.app](https://bucket-list-app-two.vercel.app)**

---

## 🧭 The Core Application Sections

| Section | Route | Core Purpose | User Mindset |
| :--- | :--- | :--- | :--- |
| **1. Home / Today** | `/home` | Personal daily snapshot connecting tasks, events, active dreams, and monthly spending. | *"What matters today?"* |
| **2. BucketList** | `/dashboard` | Long-term bucket-list goals, custom categories, milestones, and personal memory reflections. | *"What do I want to accomplish in life?"* |
| **3. Calendar** | `/calendar` | Upcoming events, schedules, important dates, and goal target dates with month/week/agenda views. | *"What is coming up?"* |
| **4. To-Do List** | `/todo` | Daily actionable tasks with date isolation, priority/category filters, checkboxes, and celebration. | *"What do I need to get done today?"* |
| **5. Expenses** | `/expenses` | Monthly expenditure tracking in Indian Rupees (₹), monthly totals, category breakdowns, and budgets. | *"Where is my money going this month?"* |

---

## ✨ Features

### 1. Home / Today — Personal Daily Dashboard
- **5-Second Life Snapshot**: Answers *"What matters today?"* with a calm, useful daily overview connecting all 4 sections.
- **Time-Aware Greeting**: Personalized greeting (`Good morning / afternoon / evening, {name}`) with context line.
- **Today at a Glance**: 4 compact live cards summarizing today's tasks, today's events, active dreams in progress, and monthly spending in ₹.
- **Today's Focus**: Surfaces max 3 top priorities derived dynamically from uncompleted high-priority tasks and upcoming events, with instant 1-click completion.
- **Section Connections**: Direct cards for *Dream in Progress* (BucketList), *Today's Schedule* (Calendar), *Today's Tasks* (To-Do), and *This Month* (Expenses).
- **Smart Empty States**: Thoughtful, encouraging empty state cards when no items are scheduled.

### 2. BucketList — Long-Term Goals & Milestones
- **Clean Task View**: Goals display title and progress indicators without clutter.
- **Milestone Detail Modal**: Clicking a goal reveals the reflection journal, target dates, completion status, and quick-actions:
  - **Schedule on Calendar**: Pre-fills the goal onto the calendar.
  - **Add to To-Do List**: Converts an aspiration into a daily actionable task.
- **Celebration & Reflections**: Completing a goal fires celebratory confetti and unlocks the memory journal.
- **Custom Categories**: Built-in starter categories plus full custom category CRUD.
- **Live Statistics**: Total goals, completed count, remaining count, and overall progress percentage.
- **Search & Filtering**: Real-time title search, category filter, and status tabs (`All`, `Active`, `Completed`).

### 3. Calendar — Upcoming Events & Schedules
- **Multiple Views**: Interactive **Month Grid**, **Week View**, and chronological **Agenda View**.
- **Event Management**: Create and edit events with Title, Date, Start/End times, Location, Reminder preferences, and color-coded Categories.
- **Today's Schedule & Upcoming List**: Side panel displaying today's agenda or upcoming dates.
- **Bucket List Linkage**: Milestone events linked back to original goals.

### 4. To-Do List — Daily Task Execution
- **Strict Date Isolation**: Tasks are assigned strictly to specific dates (`← Previous Day`, `Today`, `Next Day →`) and never bleed across days.
- **Add Task Action**: Prominent "Add Task" header button opening a dedicated task modal with Task Name, Date, Due Time, Priority, and Category.
- **Always-Visible Checkboxes**: Checkbox is always visible. Ticking applies smooth strikethrough styling and moves tasks to a collapsible `COMPLETED` section.
- **Daily Progress & Confetti**: Tracks daily progress with a progress bar and celebratory confetti when all tasks for the day are finished.
- **Task Details & Helpers**: Full editing support, individual 1-click **"Move to Today"**, and a batch **"Move All to Today"** button to instantly roll over uncompleted past tasks.

### 5. Expenses — Monthly Budget & Spend Tracking
- **Indian Rupees (₹ / INR)**: All amounts, daily averages, and category badges formatted with Indian numerical grouping (`₹1,450.50`).
- **Monthly Totals**: Prominent cards showing total spent in the selected month, top category spend, and daily average spend.
- **Month Navigation**: Easy month switcher to explore past, current, or future months.
- **Add & Edit Expenses**: Clean form modal with What I Bought, Total Price, Category, Date, and Side Notes.
- **Categories & Filtering**: Color-coded category tags (Food, Shopping, Travel, Bills, Education, Entertainment, Health, Other) with spend badges and real-time text search.

### 6. Centralized Global Theme System (6 Curated Themes)
- **6 Hand-Crafted Global Themes**:
  - **DayDream Indigo** *(Default)*: Modern, calm, professional aesthetic (`#4F5FD7`).
  - **Slate Blue**: Sophisticated, premium productivity aesthetic (`#456B8C`).
  - **Dreamy Aurora**: Soft, memorable creative aesthetic (`#7567D9`).
  - **Forest Noir**: Elegant, luxury muted botanical green aesthetic (`#2F6B57`).
  - **Ocean Mist**: Airy, refreshing coastal seafoam blue aesthetic (`#2F7F95`).
  - **Crimson Red**: Confident, luxury burgundy/rose aesthetic (`#B23A48`).
- **Unified Background Consistency**: All 4 core sections (BucketList, Calendar, To-Do List, Expenses) share the exact same dynamic theme background tint across every theme.
- **Instant Persistence**: Quick selection under `Profile → Settings → Theme` with live 4-color palette swatches and zero-flicker loading via `localStorage` and `data-theme`.

### 7. Floating Liquid-Glass Navigation & Responsive Design
- **Floating Liquid-Glass Dock**: Primary navigation floats above page content in a sleek, translucent dock with backdrop blur, specular rim highlight, and theme-reactive tinting.
- **Minimal 2-Item Collapsed State**: Displays `[ 🏠 Home ] [ ☰ Menu ]` on Home, and dynamically switches to `[ 🏠 Home ] [ Current Section ▾ ]` on inner pages for instant context and 1-click section switching without visual clutter.
- **Fluid Expansion**: Tapping the trigger smoothly expands the dock to reveal all 5 sections with icons, labels, and an intuitive close button.
- **Streamlined Single-Row Header**: Stripped out top-heavy navigation bars on desktop and mobile, giving the entire viewport back to user content.
- **Safe-Area & Scroll Padding**: Built-in safe-area inset handling and bottom padding across all pages so content never collides with the dock.
- **Vector Scalable Logo**: Crisp, lightweight SVG logo that looks sharp at all sizes on light and dark backgrounds.

### 8. Security & Infrastructure
- **Authentication**: Secure email/password authentication with `bcryptjs` hashing (10 rounds).
- **Session Security**: Stateless, secure `HttpOnly` JWT cookies verified on every request.
- **User Data Isolation**: Strict server-side `userId` scoping on all Prisma queries and mutations.
- **Maintenance Mode**: Toggleable application maintenance mode via `lib/config/maintenance.ts` and Next.js middleware.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend**: Next.js Route Handlers (`app/api/...`), Jose (JWT), Bcrypt.js
- **Database & ORM**: PostgreSQL (hosted on Neon Serverless) with Prisma ORM
- **Deployment**: Vercel CI/CD with automatic branch deployments

---

## � Project Structure

```text
DayDream/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login page
│   │   └── register/page.tsx        # Registration page
│   ├── api/
│   │   ├── auth/                    # Auth endpoints (login, register, session)
│   │   ├── bucket-list/             # Goal CRUD, complete status, reflection
│   │   ├── categories/              # Category CRUD endpoints
│   │   ├── events/                  # Calendar event CRUD endpoints
│   │   ├── expenses/                # Expense CRUD, monthly totals, breakdown
│   │   ├── home/                    # Unified home snapshot endpoint
│   │   ├── todos/                   # To-Do task CRUD, complete, move-today
│   │   └── stats/                   # Real-time dashboard statistics
│   ├── home/page.tsx                # Section 1: Home / Today Dashboard
│   ├── dashboard/page.tsx           # Section 2: BucketList Dashboard
│   ├── calendar/page.tsx            # Section 3: Upcoming Events Calendar
│   ├── todo/page.tsx                # Section 4: Daily To-Do List
│   ├── expenses/page.tsx            # Section 5: Monthly Expenses Tracker (₹)
│   ├── maintenance/page.tsx         # Maintenance mode page
│   ├── globals.css                  # Tailwind styles & animations
│   ├── layout.tsx                   # App Root Layout with providers
│   └── page.tsx                     # Landing page
├── components/
│   ├── bucket-list/                 # BucketListItem cards, detail & edit modals
│   ├── calendar/                    # MonthView, WeekView, AgendaView, Event modals
│   ├── categories/                  # CategorySection, category modals
│   ├── dashboard/                   # DashboardHeader, StatsOverview, FilterBar
│   ├── expenses/                    # MonthlyTotalCard, MonthNavigator, ExpenseCard, Modals
│   ├── navigation/                  # FloatingNav (Liquid-glass bottom dock)
│   ├── todo/                        # AddTodoTaskModal, TodoTaskItem, DateNavigator
│   ├── profile/                     # ProfileModal with user settings & 6 themes
│   ├── providers/                   # AuthProvider, ToastProvider, ThemeProvider
│   └── ui/                          # Button, Input, Textarea, Modal, ConfirmDialog, DayDreamLogo
├── lib/
│   ├── auth/                        # JWT & Session verification utilities
│   ├── config/                      # version.ts, maintenance.ts
│   ├── db/                          # Prisma Client singleton
│   └── utils/                       # cn helper
├── middleware.ts                    # Maintenance mode & route middleware
├── prisma/
│   └── schema.prisma                # PostgreSQL schema (User, Goal, Event, Todo, Expense)
├── package.json                     # v2.7.1 dependencies and scripts
└── README.md
```

---

## 🔒 Security & Data Privacy

- Passwords hashed with 10 salt rounds using `bcryptjs`.
- Session tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- All database queries and mutations enforce `where: { userId: session.userId }` preventing cross-user data access.
- Strict input validation and sanitization on all API routes.

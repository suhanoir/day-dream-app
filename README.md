# 🌟 DayDream v2.11.0 — Full-Stack Web Application

> **Version 2.11.0** · **"Complete Dual-Layer Notification System · In-App Toasts & Web Push Alerts · Make memories worth remembering."**

A production-quality, responsive Full-Stack web application combining lifelong aspirations, calendar planning, daily task execution, and monthly expense tracking into a single unified personal hub. Featuring a timeless, abstract visual identity inspired by *The Threshold* (Day & Dream figure-ground duality) alongside a calm, tactile Liquid Glass design language unified across all four core modules (To-Do, Expenses, BucketList, Calendar).

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
- **Minimal Geometric Logo**: Crisp, lightweight SVG logo that looks sharp at all sizes on light and dark backgrounds.

### 8. Security & Infrastructure
- **Authentication**: Secure email/password authentication with `bcryptjs` hashing (10 rounds).
- **Session Security**: Stateless, secure `HttpOnly` JWT cookies verified on every request.
- **User Data Isolation**: Strict server-side `userId` scoping on all Prisma queries and mutations.
- **Maintenance Mode**: Toggleable application maintenance mode via `lib/config/maintenance.ts` and Next.js middleware.

### 9. Branding & Visual Identity (v2.7.2)
- **Minimal Geometric D Mark**: Upgraded DayDream logo across the header, authentication screens, empty states, and app icons with a custom, geometric layered "D" vector mark.
- **Echo Layer Arc**: Distinctive secondary curved arc following the inner contour of the D with a small intentional negative-space gap, extending slightly lower than the inner opening baseline.
- **Clean Neutral Container**: Replaced busy gradients with a flat, soft off-white canvas (`#F4F4F2`) and fine subtle border framing (`#E5E5E2`).
- **Crisp Multi-Resolution Scaling**: Pixel-perfect geometric precision from 16×16 favicons up to 512×512 display assets.

### 10. Mobile App Startup Routing (v2.7.2)
- **Deterministic Home Startup**: Authenticated users opening or reopening DayDream (via mobile browser tab restoration, PWA launcher, page refresh, or root URL) always start cleanly on `/home`.
- **Zero Route Flicker**: Middleware-level document redirection intercepts startup navigations before HTML rendering, eliminating flashes of previously active sections (Calendar, BucketList, To-Do, Expenses).
- **Session Continuity**: Smooth client-side in-app navigation across all 5 sections remains completely preserved during active sessions.
- **Deep Link Preservation**: Preserves direct URLs with query parameters (calendar events, to-do dates) and email verification routes.

### 11. Handcrafted Acoustic & Sound System (v2.8.0)
- **7 Bespoke Audio Assets**: Handcrafted 16-bit 44.1kHz audio profiles designed to feel calm, minimal, warm, and subtle:
  - `ui-click`: Soft, tactile micro-impulse (40ms).
  - `navigation`: Gentle, airy sine swell (120ms).
  - `success`: Warm ascending major triad (E5 → G#5 → B5, 380ms).
  - `dream-complete`: Grand ethereal harmonic shimmer (F#5 → A#5 → C#6 → F#6 with bell resonance decay, 1.15s) synchronized with celebratory confetti.
  - `delete`: Subdued neutral acoustic wood tap (90ms).
  - `error`: Gentle low double-chime (280ms).
  - `notification`: Dreamy celestial chime (A5 + E6, 480ms).
- **Zero Heavy Dependencies**: Pure browser Web Audio API synthesis and preloaded buffer management with HTML5 audio fallback and strict non-blocking silent failure.
- **Settings & Volume Control**: Complete audio management under `Profile → Settings → Sound`:
  - **Sound Effects Toggle**: Instant `[ ON / OFF ]` master switch.
  - **Volume Slider**: 0% to 100% fine-grained acoustic control (default 45%).
  - **Live Sound Preview**: Interactive preview triggers for each sound profile.
  - **Persistent Storage**: Preferences saved cleanly in `localStorage` across all sessions.

### 12. Complete Dual-Layer Notification System (v2.11.0)
- **Dual-Layer Architecture**:
  - **In-App Toast Layer**: Responsive viewport-centered notifications with category-specific semantic icons (`CheckCircle2`, `Calendar`, `Sparkles`, `Receipt`, `Sun`, `Bell`).
  - **System Web Push Layer**: True background browser notifications dispatched even when the app is closed, powered by a custom Service Worker (`public/sw.js`), VAPID encryption, and server-side `web-push`.
- **Profile Notification Settings**:
  - **Master Switch**: Single toggle controlling global notification dispatch across all registered devices.
  - **Explicit Permission Flow**: Respectful, user-initiated permission prompt with browser settings advisory if previously blocked.
  - **Granular Category Toggles**: Dedicated controls for To-Do & Tasks, Calendar & Events, Bucket List & Dreams, Expenses & Finances, and Daily DayDream.
  - **Customizable Reminder Timing**: Select alert windows for tasks and events (at time, 15m before, 30m before, 1h before, morning of).
  - **Quiet Hours Scheduling**: Automatically holds and silences push notifications overnight (default: 10:00 PM – 7:00 AM) based on user local time.
  - **Real "Send Test Notification"**: Instant end-to-end verification triggering both an in-app toast and a real Web Push alert to the user's device tray.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, Web Audio API, Push API & Service Worker
- **Backend**: Next.js Route Handlers (`app/api/...`), Jose (JWT), Bcrypt.js, Web-Push (VAPID)
- **Database & ORM**: PostgreSQL (hosted on Neon Serverless) with Prisma ORM
- **Deployment**: Vercel CI/CD with automatic branch deployments

---

## 📂 Project Structure

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
│   ├── layout.tsx                   # App Root Layout with Sound, Toast, Auth & Theme providers
│   └── page.tsx                     # Landing page
├── components/
│   ├── bucket-list/                 # BucketListItem cards, detail & edit modals
│   ├── calendar/                    # MonthView, WeekView, AgendaView, Event modals
│   ├── categories/                  # CategorySection, category modals
│   ├── dashboard/                   # DashboardHeader, StatsOverview, FilterBar
│   ├── expenses/                    # MonthlyTotalCard, MonthNavigator, ExpenseCard, Modals
│   ├── navigation/                  # FloatingNav (Liquid-glass bottom dock)
│   ├── todo/                        # AddTodoTaskModal, TodoTaskItem, DateNavigator
│   ├── profile/                     # ProfileModal with user settings, sound controls & themes
│   ├── providers/                   # SoundProvider, AuthProvider, ToastProvider, ThemeProvider
│   └── ui/                          # Button, Input, Textarea, Modal, ConfirmDialog, DayDreamLogo
├── lib/
│   ├── auth/                        # JWT & Session verification utilities
│   ├── config/                      # version.ts, maintenance.ts
│   ├── db/                          # Prisma Client singleton
│   ├── sound/                       # soundConfig.ts (types, paths, weights)
│   └── utils/                       # cn helper
├── public/
│   └── sounds/                      # Handcrafted audio assets (ui, nav, success, feedback, notification)
├── middleware.ts                    # Maintenance mode & route middleware
├── prisma/
│   └── schema.prisma                # PostgreSQL schema (User, Goal, Event, Todo, Expense)
├── package.json                     # v2.10.0 dependencies and scripts
└── README.md
```

---

## 🔒 Security & Data Privacy

- Passwords hashed with 10 salt rounds using `bcryptjs`.
- Session tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- All database queries and mutations enforce `where: { userId: session.userId }` preventing cross-user data access.
- Strict input validation and sanitization on all API routes.

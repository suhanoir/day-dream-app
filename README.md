# 🌟 DayDream v2.14.0 — Full-Stack Web Application

> **Version 2.14.0** · **"Keepsake Album & Contrast Upgrade · Multi-Photo Albums, Full-Screen Lightbox & System-Wide Contrast"**

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
| **6. Memory Scrapbook** | `/memories` | Visual gallery of achieved aspirations, memory postcards, and personal reflections. | *"What memories have I created?"* |

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

### 6. Centralized Global Theme System (6 Light + 6 Dark Themes)
- **12 Handcrafted Themes (6 Light + 6 Dark Architecture)**:
  - **☀️ Light Themes (6)**:
    - **DayDream Indigo** *(Default)*: Modern, calm, professional aesthetic (`#4F5FD7`).
    - **Crimson Red**: Confident, luxury burgundy/rose aesthetic (`#B23A48`).
    - **Deep Aqua**: Vibrant ocean cyan & teal aesthetic (`#0E7490`).
    - **Royal Indigo**: Regal violet & electric indigo aesthetic (`#4338CA`).
    - **Sunset Coral**: Warm sunset coral & burnt amber aesthetic (`#C2410C`).
    - **Vibrant Emerald**: Luminous jewel emerald & jade aesthetic (`#047857`).
  - **🌙 Dark Themes (6)**:
    - **Slate Blue**: Minimal, cool, architectural graphite & slate (`#0D1117`).
    - **Dreamy Aurora**: Celestial, creative twilight violet & neon aura (`#0F0D1A`).
    - **Forest Noir**: Nocturnal botanical evergreen & mint (`#0B130E`).
    - **Ocean Mist**: Abyssal oceanic trench deep dark (`#08121A`).
    - **Imperial Ruby**: Velvet midnight wine & luxury gemstone dark (`#160A0E`).
    - **Midnight Citrus** *(Gold Standard)*: Nocturnal luxury & radiant golden citrus (`#12151D`).
- **10-Level Inverted Tailwind Stone Bridge**: Each dark theme provides an inverted 10-level stone scale (`--color-stone-50` through `--color-stone-950`) ensuring all components across To-Do, Calendar, BucketList, Expenses, and Modals render with crisp contrast, elevated surfaces, and theme-tinted borders.
- **Structured Theme Selector**: Organized in `Profile → Settings → Theme` into clear **☀️ Light Themes (6)** and **🌙 Dark Themes (6)** sections with real 4-color palette swatches and zero-flicker loading via `localStorage` and `data-theme-mode`.

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

### 13. Native Time Picker for Due Time (v2.11.1)
- **Native Device Time Selection**: Replaced manual text typing (`e.g. 5:00 PM`) in the To-Do task creation and editing modals with the browser and operating system's native time picker (`<input type="time">`).
- **Unified Visual Styling**: Due Time perfectly matches the Date input's border-radius, liquid-glass backdrop, theme variables, and icon alignment (`Clock` icon side-by-side with `Calendar` icon).
- **One-Tap Quick Clear**: Added a dedicated, unobtrusive "Clear" action when a time is selected, preserving the optional nature of task due times.
- **Bi-directional Time Normalization**: Seamlessly parses legacy task times (e.g. `"5:00 PM"`, `"5:00pm"`) to initialize native pickers (`"17:00"`), while formatting task times cleanly according to the user's locale (12-hour or 24-hour).
- **Theme-Adaptive Indicator**: Enhanced calendar and clock picker indicators with smooth hover transitions and automatic contrast inversion in dark themes like Midnight Citrus.

### 14. 6 Light Themes + 6 Dark Themes — Premium Dark Expansion (v2.12.0)
- **Balanced 6 Light + 6 Dark Architecture**:
  - Rebalanced the entire theme catalog into an equal collection of 6 Light Themes and 6 Dark Themes.
  - **Light Themes**: DayDream Indigo, Crimson Red, Deep Aqua, Royal Indigo, Sunset Coral, Vibrant Emerald.
  - **Dark Themes**: Slate Blue, Dreamy Aurora, Forest Noir, Ocean Mist, Imperial Ruby, Midnight Citrus.
- **Midnight Citrus as the Gold Standard**: Applied the dark design language of Midnight Citrus (ambient glow, elevated surfaces, high contrast, specular rims) to craft 5 new distinctive, luxury dark themes from the ground up.
- **Dedicated 10-Level Inverted Stone Bridges**: Each dark theme specifies its own tailored 10-level stone scale (`--color-stone-50` through `--color-stone-950`), allowing all pre-existing UI elements across To-Do, Calendar, BucketList, Expenses, and Modals to seamlessly adapt with zero component-level hacks.
- **Categorized Theme Selector**: Reorganized `Profile → Settings → Theme` into responsive, grouped sections (`☀️ Light Themes` and `🌙 Dark Themes`) with live 4-color palette swatches and theme mode indicators.
- **Zero-Flicker Hydration (`data-theme-mode`)**: Inline `<head>` script sets both `data-theme` and `data-theme-mode` synchronously from `localStorage`, preventing any flash of unstyled content upon page reload.

### 15. Premium Landing Page Experience & Visual Storytelling (v2.12.1)
- **Product-First Visual Storytelling ("DayDream, Before You Enter DayDream")**:
  - Rebuilt `app/page.tsx` from the ground up into a 14-section product experience that immediately showcases the real DayDream app within 20–30 seconds.
  - Shares the exact design tokens, liquid glass cards, specular highlights, typography (`Instrument Serif` + sans-serif UI), and color palettes of the live app.
- **13 Harmonious Storytelling Sections**:
  - **1. Header**: Liquid glass floating header with The Threshold logo mark, navigation anchors (`#features`, `#how-it-works`, `#memories`, `#themes`), Sign In button, and primary CTA with mobile drawer menu.
  - **2. Hero**: Elegant typography, high-converting eyebrow badge, headline (*"A place for the things you actually want to do with your life"*), and dual CTAs (*"Begin Your DayDream"* + *"Explore the Experience"*).
  - **3. Real Product Preview**: Authentic liquid-glass mockup previewing the DayDream BucketList interface, live progress bars, category tabs, and a completed celebration card.
  - **4. Your Dreams, Organized**: Interactive category showcase displaying real DayDream categories (Travel, Skills, Life, Career, Experiences, Custom) with real sample aspirations.
  - **5. More Than a Bucket List**: The 4 Pillars breakdown (DREAM, PLAN, LIVE, REMEMBER) with micro UI previews for each core feature module.
  - **6. How It Works**: 4 clear, rhythmic steps demonstrating how aspirations transform into daily reality and lasting reflections.
  - **7. Reflection & Memory Showcase**: Faithful reproduction of the DayDream reflection card (*"Solo trip to Kyoto"*), highlighting the personal memory journal and timestamped reflections.
  - **8. Live Theme Preview Switcher**: Interactive selector previewing 6 signature themes (DayDream Indigo, Sunset Coral, Vibrant Emerald, Forest Noir, Slate Blue, Midnight Citrus) with live color palette tokens.
  - **9. Midnight Citrus Dark Showcase**: A cinematic dark container displaying DayDream's luxury dark mode styling with ambient amber glow and specular accents.
  - **10. Acoustic Atmosphere**: Overview of DayDream's handcrafted Web Audio soundscapes (chime, click, celebration) with zero unprompted autoplay.
  - **11. Emotional Centerpiece**: *"One day, your bucket list becomes your memory."*
  - **12. Final Call-to-Action**: Magnetic closing invitation (*"What's the next memory you're going to make?"*) with direct auth links.
  - **13. Minimal Footer**: Quiet footer with brand mark, tagline, smooth navigation links, and version identifier (`DayDream v2.12.2`).

### 16. Clean Removal of Reminders, Notifications & Due Time (v2.12.2)
- **Clean Architecture & Non-Breaking Removal**:
  - Completely decommissioned user-facing Reminders, Push Notifications, and To-Do Due Time inputs across the platform.
  - Preserved database schema integrity without destructive migrations; legacy data gracefully ignored.
- **Removed User-Facing Controls**:
  - **Profile & Settings**: Removed "Notifications / Alerts" settings menu and push subscription controls.
  - **Dashboard Header**: Removed "Notifications / Alerts" navigation entry.
  - **To-Do Tasks**: Removed "Due Time (Optional)" input and time badges from task items and detail modals; refactored date inputs to clean full-width fields.
  - **Calendar Events**: Removed reminder dropdown selector and reminder indicators from event modals.
  - **Landing Page**: Removed Section 8 ("Gentle Reminders") and reminder references.
- **Backend & Service Worker Cleanup**:
  - Removed push endpoints, subscription management, cron reminder workers, and `web-push` dependency.
  - Cleaned Service Worker (`public/sw.js`) down to essential PWA caching/activation lifecycle while preserving installability.
  - Retained in-app UI feedback toast system (`ToastProvider`) and Web Audio sound effects.

### 17. Memory Postcard & Visual Scrapbook (v2.13.0)
- **Transforming Accomplished Aspirations into Keepsakes**:
  - The emotional centerpiece of DayDream: *"One day, your bucket list becomes your memory."*
  - Completed bucket-list dreams and reflection journals can now be rendered into authentic, tangible **Memory Postcards**.
- **Postcard Editor with Real-Time Live Preview**:
  - **3 Elegant Compositions**:
    - **Polaroid**: Classic photo-first keepsake with vintage margin, serif display headline, reflection excerpt, and subtle DayDream seal.
    - **Editorial**: Modern museum/art-gallery print with category pill, framed cover photo, and architectural layout.
    - **Journal**: Luxury stationery page with decorative frame, watermark branding, and large contemplative reflection quote.
  - **Optional Single Cover Photo**: Client-side compressed upload (max 1200px, WebP/JPEG), with replace and remove controls, cropped gracefully into the postcard frame.
  - **12-Theme Atmosphere**: Inherits the user's active theme or allows selecting any of DayDream's 6 Light or 6 Dark themes (featuring specialized obsidian & warm amber treatment for **Midnight Citrus**).
  - **Smart Content Adaptability**: Graceful fallback when no photo is attached (clean typographic composition) and subtle quote placeholder (*"Another dream lived."*) when no reflection is written yet.
- **High-Resolution Export & Native Sharing**:
  - High-DPI 2x Retina PNG export powered by `html-to-image`.
  - Native Web Share API integration on mobile devices with seamless fallback to direct file download.
- **Visual Scrapbook / Memory Gallery (`/memories`)**:
  - A living gallery displaying completed dreams as personal memories rather than closed checklist tasks.
  - Search and category filters.
  - Heartfelt empty state for new accounts (*"Your scrapbook is waiting. Complete your first dream and the memory will live here."*).
  - Memory Detail Modal with full reflection viewer, PNG download, and postcard customization.
- **Privacy & Database Security**:
  - Stored privately on `BucketListItem` in PostgreSQL (`memoryPhoto`, `memoryPhotos`, `postcardStyle`), strictly scoped to `userId: session.userId`.
  - Zero public photo exposure; User A cannot access or mutate User B's memories or images.

### 18. Keepsake Album & System-Wide Contrast Upgrade (v2.14.0)
- **Multi-Photo Keepsake Albums (Up to 10 Photos per Dream)**:
  - Upgraded from single photo to an album storing up to 10 photos per dream.
  - **Clean UX**: No upfront "10/10" counter clutter. Only triggers a friendly toast (*"You can add up to 10 memories to a Keepsake."*) when attempting to exceed 10.
  - Automatic cover photo assignment with manual "Set as Cover" selection.
  - Album reordering (earlier/later) and safe deletion with automatic cover promotion.
- **Full-Screen Lightbox Image Viewer (`MemoryLightbox`)**:
  - Deep backdrop blur, responsive high-resolution image viewing.
  - Touch swipe gestures for mobile devices and keyboard navigation (`ESC`, `ArrowLeft`, `ArrowRight`).
  - Active photo counter (`X of Y`), Cover Photo indicator badge, and thumbnail navigation strip.
- **System-Wide High-Contrast Design Tokens (WCAG AA Compliant)**:
  - Eliminated faint text issues across all 12 themes (Light, Dark, and Midnight Citrus).
  - Semantic typography tokens (`--text-primary`, `--text-secondary`, `--text-muted`, `--surface-journal`).
  - Dedicated `.glass-journal` reflection card with crisp serif typography and specular liquid glass borders.
  - Upgraded `CategoryBadge` with dark-mode support across all palette colors.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, HTML-to-Image, Web Audio API, Service Worker PWA
- **Backend**: Next.js Route Handlers (`app/api/...`), Jose (JWT), Bcrypt.js
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
│   │   ├── bucket-list/             # Goal CRUD, complete, reflection, postcard
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
│   ├── memories/page.tsx            # Section 6: Memory Scrapbook & Gallery
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
│   ├── memory/                      # MemoryPostcard, PostcardEditor, DetailModal, ScrapbookCard
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
│   └── utils/                       # cn helper, imageExport.ts
├── public/
│   └── sounds/                      # Handcrafted audio assets
├── middleware.ts                    # Maintenance mode & route middleware
├── prisma/
│   └── schema.prisma                # PostgreSQL schema (User, Goal, Event, Todo, Expense)
├── package.json                     # v2.14.0 dependencies and scripts
└── README.md
```

---

## 🔒 Security & Data Privacy

- Passwords hashed with 10 salt rounds using `bcryptjs`.
- Session tokens stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
- All database queries and mutations enforce `where: { userId: session.userId }` preventing cross-user data access.
- Strict input validation and sanitization on all API routes.

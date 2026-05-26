# SpendWise — Smart Expense Tracker SaaS

A premium fintech-grade expense tracking application built with React + Vite + Supabase.

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Charts**: Recharts
- **Auth & DB**: Supabase
- **State**: Context API + Zustand (optional)
- **Icons**: Lucide React
- **Routing**: React Router v6

---

## Quick Start

### Step 1 — Clone and install

```bash
git clone <your-repo>
cd spendwise
npm install
```

### Step 2 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Choose a name (e.g. `spendwise`), set a database password, choose a region
4. Wait ~2 minutes for project to spin up

### Step 3 — Run the database SQL

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of `supabase_setup.sql`
4. Click **Run**

This creates:
- `profiles` table (linked to auth users)
- `expenses` table
- `budgets` table
- Row Level Security (RLS) policies
- Auto-create profile trigger on signup
- Storage bucket for avatars
- Performance indexes

### Step 4 — Get your API keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **anon public** key

### Step 5 — Set up .env

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6 — Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Enable Email Auth in Supabase

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. For email verification: go to **Authentication → Email Templates** and customize
4. For password reset: already handled — the app sends reset emails automatically

### Disable email confirmation (for testing)

1. Go to **Authentication → Settings**
2. Toggle off **Enable email confirmations**
3. Users can sign in immediately without verifying email

---

## Project Structure

```
src/
├── components/
│   ├── auth/           # AuthLayout, PasswordInput, PasswordStrengthBar
│   ├── dashboard/      # StatCard
│   ├── expenses/       # ExpenseModal
│   └── ui/             # ProtectedRoute
├── pages/
│   ├── Landing.jsx     # Public landing page
│   ├── Login.jsx       # Sign in
│   ├── SignUp.jsx      # Register
│   ├── ForgotPassword.jsx
│   ├── ResetPassword.jsx
│   ├── Dashboard.jsx   # Main overview
│   ├── Expenses.jsx    # Full CRUD list
│   ├── Analytics.jsx   # Charts & insights
│   ├── Profile.jsx     # User profile
│   └── Settings.jsx    # Preferences
├── layouts/
│   └── AppLayout.jsx   # Sidebar + navbar shell
├── hooks/
│   └── useExpenses.js  # Expense data hook
├── services/
│   └── expenseService.js  # Supabase DB calls + categories
├── context/
│   ├── AuthContext.jsx  # Auth state
│   └── ThemeContext.jsx # Dark/light mode
├── utils/
│   └── helpers.js      # formatCurrency, dates, export
└── supabase/
    └── client.js       # Supabase client
```

---

## Features

- ✅ Sign up / Sign in / Forgot password / Reset password
- ✅ Email verification flow
- ✅ Auto profile creation on signup
- ✅ Dark mode default (toggleable)
- ✅ Dashboard with stats, charts, recent transactions
- ✅ Add / Edit / Delete expenses
- ✅ 6 categories: Food, Transport, Shopping, Bills, Health, Entertainment
- ✅ Search, filter by category, sort by date
- ✅ Analytics: bar chart, pie chart, area chart, category breakdown
- ✅ Profile: edit name/phone, change password, upload avatar
- ✅ Settings: currency selector (₹, $, €, £, ¥, A$)
- ✅ Export to CSV
- ✅ Row Level Security — users only see their own data
- ✅ Skeleton loaders
- ✅ Glassmorphism UI with Framer Motion animations
- ✅ Mobile-first responsive design
- ✅ Password strength meter

---

## Build for production

```bash
npm run build
npm run preview
```

Deploy to Vercel, Netlify, or any static host.

---

## Common Issues

**"relation expenses does not exist"** → Run `supabase_setup.sql` in SQL Editor

**Auth not working** → Check `.env` values match your Supabase project

**Avatar upload fails** → Make sure the storage bucket SQL ran successfully, or create an `avatars` bucket manually in Supabase Storage → Settings → Public bucket = ON

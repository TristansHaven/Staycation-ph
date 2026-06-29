# Staycation PH — Booking & Management System

A full-stack web app for managing a staycation property in General Emilio Aguinaldo, Cavite.

---

## What this app does

- **Customer booking page** — guests choose their house, check availability, fill in details, and pay
- **Owner dashboard** — you manage bookings, view the calendar, reply to inquiries, track expenses
- **AI chat assistant** — Claude answers guest questions 24/7 automatically
- **Google Sheets** — stores all data (no database setup needed)
- **Google Calendar** — blocks booked dates automatically

---

## Phase 1 Setup Instructions

Follow these steps carefully before running the app.

---

### Step 1 — Install Node.js

Download and install Node.js 18 or higher from https://nodejs.org
Verify it works by running in your terminal:
```
node -v
npm -v
```

---

### Step 2 — Install project dependencies

Open a terminal, navigate to this project folder, then run:
```
npm install
```

This installs all required packages listed in `package.json`.

---

### Step 3 — Set up Google Cloud (for Sheets + Calendar)

1. Go to https://console.cloud.google.com
2. Click **"New Project"** → name it `staycation-ph` → click Create
3. Wait for it to create, then make sure it's selected at the top

**Enable APIs:**
4. In the left menu, go to **APIs & Services → Library**
5. Search **"Google Sheets API"** → click it → click **Enable**
6. Search **"Google Calendar API"** → click it → click **Enable**

**Create a Service Account:**
7. Go to **APIs & Services → Credentials**
8. Click **+ Create Credentials → Service Account**
9. Name it `staycation-sheets` → click **Create and Continue** → click **Done**
10. Click on the service account you just created
11. Go to the **Keys** tab → **Add Key → Create New Key → JSON** → click Create
12. A JSON file downloads to your computer — keep this safe!

**Get your credentials from the JSON file:**
- Open the downloaded JSON file
- Copy the value of `"client_email"` → this is your `GOOGLE_SHEETS_CLIENT_EMAIL`
- Copy the value of `"private_key"` → this is your `GOOGLE_SHEETS_PRIVATE_KEY`

---

### Step 4 — Set up Google Sheets

1. Go to https://sheets.google.com
2. Create a new blank spreadsheet
3. Name it **"Staycation PH — Bookings"**
4. Click **Share** (top right) → paste your `client_email` from step 3 → set to **Editor** → click Send
5. Copy the spreadsheet ID from the URL:
   - URL looks like: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
   - This is your `GOOGLE_SPREADSHEET_ID`

> The app will automatically create all tabs and headers when you first run `/api/init`

---

### Step 5 — Set up Google Calendar

1. Go to https://calendar.google.com
2. In the left sidebar, click **+ Other calendars → Create new calendar**
3. Name it **"House 1 — Staycation PH"** → click Create Calendar
4. Repeat and create **"House 2 — Staycation PH"**

**For each calendar:**
5. Click the three dots next to the calendar name → **Settings and sharing**
6. Share with your service account email (same `client_email`) with **Make changes to events** access
7. Scroll to **"Make available to public"** → check it (so guests can view availability)
8. Scroll down to **"Integrate calendar"** → copy the **Calendar ID**
   - Looks like: `xxxxxxxxxxxxxxxxxxxx@group.calendar.google.com`
   - House 1 ID → `GOOGLE_CALENDAR_ID_HOUSE1`
   - House 2 ID → `GOOGLE_CALENDAR_ID_HOUSE2`

---

### Step 6 — Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click **API Keys** in the left menu → **Create Key**
4. Name it `staycation-ph` → copy the key (starts with `sk-ant-`)
5. This is your `ANTHROPIC_API_KEY`

---

### Step 7 — Set up PayMongo

1. Sign up at https://dashboard.paymongo.com
2. Complete your business profile (required for live transactions)
3. Go to **Developers → API Keys**
4. Copy **Secret Key** → `PAYMONGO_SECRET_KEY`
5. Copy **Public Key** → `PAYMONGO_PUBLIC_KEY`

> Use `sk_test_` / `pk_test_` keys while testing. Switch to live keys when ready to accept real payments.

---

### Step 8 — Set up Gmail for sending emails

1. Log into the Gmail account you'll use for the business
2. Go to your **Google Account → Security**
3. Make sure **2-Step Verification** is ON (required)
4. Search for **"App Passwords"** in the search bar
5. Select app: **Mail** → click Generate
6. Copy the 16-character password (spaces don't matter)
7. This is your `GMAIL_APP_PASSWORD`

---

### Step 9 — Generate your owner password hash

You need to convert your dashboard password into a secure hash. Run this in your terminal:

```
node -e "const b=require('bcryptjs'); console.log(b.hashSync('YourPasswordHere', 10))"
```

Replace `YourPasswordHere` with a strong password. Copy the output — this is your `OWNER_PASSWORD_HASH`.

---

### Step 10 — Create your .env.local file

1. In the project folder, copy the example file:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in any text editor
3. Fill in every value using what you gathered in steps 3–9
4. Fill in your GCash number, bank details, and property rates

---

### Step 11 — Generate NEXTAUTH_SECRET

Run this in your terminal and copy the output:
```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Paste it as `NEXTAUTH_SECRET` in `.env.local`.

---

### Step 12 — Run the app

```
npm run dev
```

Open your browser to: **http://localhost:3000**

---

### Step 13 — Initialize Google Sheets (one time only)

After the app is running, open this URL in your browser:
```
http://localhost:3000/api/init
```

You should see:
```json
{ "success": true, "message": "Google Sheets initialized successfully." }
```

This creates all tabs (Bookings, Inquiries, Expenses, Settings) with the correct headers automatically.

---

## Project structure

```
staycation-ph/
├── app/                    ← All pages and API routes
│   ├── page.tsx            ← Home/landing page
│   ├── booking/            ← Customer booking form (Phase 2)
│   ├── dashboard/          ← Owner dashboard (Phase 2)
│   ├── auth/               ← Login page (Phase 2)
│   └── api/
│       ├── init/           ← One-time setup route
│       ├── bookings/       ← Booking CRUD (Phase 2)
│       ├── chat/           ← AI chat endpoint (Phase 3)
│       └── availability/   ← Calendar check (Phase 2)
├── components/             ← Reusable UI components (Phase 2)
├── lib/
│   ├── sheets.ts           ← ✅ Google Sheets helpers (Phase 1)
│   ├── calendar.ts         ← Google Calendar helpers (Phase 1 stub)
│   ├── claude.ts           ← AI chat wrapper (Phase 1 stub)
│   ├── email.ts            ← Email helpers (Phase 1 stub)
│   ├── auth.ts             ← NextAuth config (Phase 1 stub)
│   └── utils.ts            ← Shared utilities (Phase 1)
├── types/
│   └── index.ts            ← ✅ All TypeScript types (Phase 1)
├── .env.local.example      ← ✅ Environment variable template
├── .env.local              ← Your actual secrets (never commit this)
├── package.json            ← Dependencies
├── tailwind.config.js      ← Brand colors and design tokens
└── tsconfig.json           ← TypeScript config
```

---

## Build phases

| Phase | What gets built | Status |
|-------|----------------|--------|
| Phase 1 | Project setup, folder structure, Google Sheets lib | ✅ Done |
| Phase 2 | Customer booking form + Owner dashboard | Next |
| Phase 3 | AI chat, payments, emails, calendar blocking | Later |
| Phase 4 | Mobile polish, error handling, Vercel deployment | Later |

---

## Deploying to Vercel (when ready)

1. Push this project to a GitHub repository
2. Go to https://vercel.com → Import your repository
3. Add all your `.env.local` values in the **Environment Variables** section
4. Click Deploy
5. Visit your live URL → run `/api/init` once to initialize the sheets

---

## Support

If something isn't working, check:
1. Are all `.env.local` values filled in correctly?
2. Did you share the Google Sheet with your service account email?
3. Did you share both Google Calendars with your service account email?
4. Did you run `/api/init` after starting the app?

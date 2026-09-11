# Planora — Smart Life Management Application

> **"Everything you need to pay, plan and remember — in one place."**

Planora is a full-stack personal life-management web application that seamlessly combines:
1. **Bill & Payment Calendar** (with recurring payment engine & auto-occurrence creation)
2. **Smart AI Checklists** (with Gemini AI natural language trip generator & real-time Weather forecasting)
3. **Tasks & Reminders** (with priority levels & browser push notifications)
4. **Smart "Today" Unified Dashboard** (all urgent items & upcoming timeline)
5. **Google OAuth 2.0 & MongoDB Atlas** (Secure user authentication & live cloud database persistence)

---

## 🌟 Key Features

- **Google OAuth 2.0 Auth**: Quick one-click sign-in with Google profile sync and persistent sessions.
- **MongoDB Atlas Cloud Database**: Real-time cloud persistence for bills, checklists, tasks, and reminders.
- **AI & Weather Integration**: Generates customized packing lists powered by Google Gemini API and live Open-Meteo weather forecasts.
- **Unified Smart "Today" View**: Displays urgent bills, active trip checklists with progress bars, tasks, and reminders in one dashboard.
- **Bill & Payment Calendar**: Monthly and Weekly view showing color-coded indicators for bills 💰, tasks ✅, checklists 📋, and reminders 🔔.
- **Smart Recurring Payments**: Marking a recurring bill paid automatically calculates and schedules the next occurrence (Monthly, Yearly, Weekly, Quarterly).
- **Responsive PWA Layout**: Works seamlessly on mobile devices with bottom bar navigation, mobile action sheet, touch controls, and PWA installation support.
- **Theme Switcher**: Dark mode, Light mode, and System preference matching.

---

## 🏗️ Project Architecture

```
Planora/
├── backend/
│   ├── server.js                 # Express REST API Server (Port 5000)
│   ├── services/
│   │   ├── dbService.js          # Mongoose database models & MongoDB Atlas connection
│   │   └── aiService.js          # Gemini AI service & Open-Meteo weather integration
│   └── routes/
│       ├── auth.js               # Google OAuth token verification & user login
│       ├── bills.js              # Bills CRUD & /pay recurring handler
│       ├── checklists.js         # Checklists CRUD & /ai-generate endpoint
│       ├── tasks.js              # Tasks CRUD & priority filtering
│       ├── reminders.js          # Reminders CRUD & alerts
│       ├── dashboard.js          # Aggregated Today & Stats endpoint
│       ├── search.js             # Global multi-entity search endpoint
│       ├── ai.js                 # Natural language prompt parser
│       └── settings.js           # User settings
├── frontend/
│   ├── src/
│   │   ├── components/           # UI Views (Dashboard, Bills, Checklists, Calendar, Tasks, Reminders, Settings, Landing)
│   │   ├── context/              # AuthContext & AppContext
│   │   ├── services/             # API client (Axios/Fetch)
│   │   ├── App.jsx               # Main React Application
│   │   └── index.css             # Tailwind CSS & design tokens
│   ├── public/manifest.json      # PWA Web Manifest for Mobile App Installation
│   └── vite.config.js
└── README.md
```

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Render / Railway)

1. Create a free account on [Render.com](https://render.com).
2. Click **New +** -> **Web Service** and connect your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Set Build Command: `npm install`
5. Set Start Command: `node server.js`
6. Add Environment Variables in Render:
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://Planora:planora@cluster0.o094w8u.mongodb.net/planora?retryWrites=true&w=majority&appName=Cluster0`
   - `GEMINI_API_KEY`: `your-gemini-api-key`
   - `GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `your-google-client-secret`
7. Copy your deployed backend URL (e.g., `https://planora-backend.onrender.com`).

---

### 2. Frontend Deployment (Vercel)

1. Create a free account on [Vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. Set **Framework Preset** to **Vite**.
4. Set **Root Directory** to `frontend`.
5. Add Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: `https://planora-backend.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: `1550457243-dgonolpmqc0kbj5l773es0b766lm626j.apps.googleusercontent.com`
6. Click **Deploy**. Vercel will give you a public URL (e.g. `https://planora.vercel.app`).

---

### 3. Update Google Cloud Console

In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials):
1. Add your Vercel URL to **Authorized JavaScript origins**:
   `https://planora.vercel.app`
2. Add your Vercel URL to **Authorized redirect URIs**:
   `https://planora.vercel.app`

---

## 📱 How to Install Planora as a Mobile / Desktop App (PWA)

Planora is built as a Progressive Web App (PWA). You can install it directly onto your phone or desktop without downloading from App Store or Play Store:

### On Android (Chrome / Edge / Brave):
1. Open `https://planora.vercel.app` (or `http://localhost:5173`) on your phone browser.
2. Tap the **3 dots menu (⋮)** at top right.
3. Tap **"Add to Home Screen"** or **"Install app"**.
4. Planora will install as a standalone mobile app with its own icon on your launcher!

### On iPhone / iOS (Safari):
1. Open `https://planora.vercel.app` in **Safari**.
2. Tap the **Share** button (box with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**.

### Generate an Android APK File (Optional):
If you want a native `.apk` file:
1. Go to [PWABuilder.com](https://www.pwabuilder.com/).
2. Enter your live website URL (`https://planora.vercel.app`).
3. Click **Package for Store** -> Choose **Android**.
4. Download the ready-to-install `.apk` or `.aab` file!


# 🏋️ Alpha Fit Gym - Frontend UI

The modern, lightning-fast frontend for the **Alpha Fit Gym Management System**. Built seamlessly for both Gym Administrators (management, members, revenue) and Gym Members (workouts, payment history, notifications).

---

## 🚀 Tech Stack

*   **Framework:** React 18
*   **Build Tool:** Vite
*   **Routing:** React Router DOM v6
*   **State Management:** React Context API (`AuthContext`)
*   **HTTP Client:** Axios (with smart interceptors)
*   **Styling:** Custom CSS with CSS Variables

---

## 📁 Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/           # Logos, icons, branding
│   ├── components/       # Reusable UI (AdminLayout, Layout, BottomNav, StatCard)
│   ├── context/          # Global Auth Provider
│   ├── pages/
│   │   ├── admin/        # Admin Views (Dashboard, Members, Payments, Workouts Management)
│   │   └── member/       # Member Views (Login, Profile, Interactive Workouts)
│   ├── utils/
│   │   ├── api.js        # Axios instance & token interceptors
│   │   └── helpers.js    # Currency and date formatters
│   ├── App.jsx           # Global Router & Tab Branding Injection
│   ├── Home.jsx          # Member Dashboard & Notification Bell Hub
│   ├── main.jsx
│   └── index.css         # Global Styles & Theme
├── vercel.json           # Vercel SPA Fallback routing
└── vite.config.js
```

---

## ⚙️ Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of your `frontend` directory:

```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Start the Vite Server
```bash
npm run dev
```
*The frontend will run locally on `http://localhost:5173`.*

---

## ☁️ Deployment (Vercel)

This frontend is perfectly structured for immediate deployment on **Vercel**.

1.  Import this repository into Vercel.
2.  Vercel will auto-detect **Vite** as the framework.
3.  Add the Environment Variable: `VITE_API_URL` targeting your live backend (e.g., `https://alphafit-backend.onrender.com/api`).
4.  *Note:* The `vercel.json` file is already included in this repository to prevent 404 errors when refreshing React Router URLs.

---

## ✨ Key UI Features

*   **Unified Workouts Grid:** A single `AdminWorkouts.jsx` component elegantly adapts depending on the logged-in role. Admins get CRUD controls, while members get a beautiful read-only UI with intuitive Category and Muscle Group filters.
*   **Live Notification Hub:** Members have a dynamic bell icon in their dashboard header. A red dot automatically appears when a backend cron job warns them of an upcoming expiry or confirms a payment.
*   **Progressive Web App Feeling:** Dedicated Mobile/Desktop layouts combined with a smart `BottomNav` allows users to navigate instantly without full page reloads.
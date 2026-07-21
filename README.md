# CIMS — Client Information Management System

A secure, full-stack web application for legal and tax professionals to manage client records.

## Default Login
```
Username: admin
Password: Admin@123
```

---

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** JWT (7-day tokens)

---

## Run Locally (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)

### 1. Clone & Install
```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install
```

### 2. Configure Backend
Edit `server/.env`:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/cims_db
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start Development Servers
Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open http://localhost:5173

---

## Deploy to Railway (Free)

### Step 1 — Create Railway Account
Go to [railway.app](https://railway.app) and sign up (free)

### Step 2 — Push to GitHub
```bash
# Initialize git in AQIB folder
git init
git add .
git commit -m "Initial CIMS commit"
# Create a new GitHub repo and push
git remote add origin https://github.com/yourusername/cims.git
git push -u origin main
```

### Step 3 — Create Railway Project
1. Go to Railway dashboard → **New Project**
2. Click **Deploy from GitHub repo** → select your repo
3. Add a **PostgreSQL** plugin:
   - In your project → click **+ New** → **Database** → **PostgreSQL**
   - Railway will auto-add `DATABASE_URL` to your environment

### Step 4 — Configure Backend Service
In Railway, click on your backend service → **Variables** → Add:
```
PORT=5000
JWT_SECRET=your_super_secret_key_here_change_this
NODE_ENV=production
FRONTEND_URL=https://your-frontend.up.railway.app
```

Set **Root Directory** to `server`
Set **Start Command** to `npm start`

### Step 5 — Add Frontend Service
1. In Railway project → **+ New** → **GitHub Repo** (same repo)
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Start Command** to `npx serve dist`
5. Add variable: `VITE_API_URL=https://your-backend.up.railway.app`

### Step 6 — Done!
Railway gives you URLs like:
- Frontend: `https://cims-frontend.up.railway.app`
- Backend: `https://cims-backend.up.railway.app`

---

## Features
- ✅ Secure JWT authentication (Admin + Staff roles)
- ✅ Client registration with all fields (CNIC, NTN, STRN, etc.)
- ✅ Advanced multi-field search with partial matching
- ✅ Document upload (PDF, images, Word, Excel)
- ✅ Client profile with full information display
- ✅ Audit log (every action logged with timestamp)
- ✅ Export clients to CSV or Excel
- ✅ Print client profiles
- ✅ Archive/restore clients
- ✅ User management (admin only)
- ✅ Change password
- ✅ Responsive design (desktop, tablet, mobile)

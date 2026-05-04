# RemoveBG Pro 🎨

**AI-powered background removal SaaS** built with React + Vite + Node.js + Express.

---

## 🏗️ Project Structure

```
removebg-pro/
├── client/               # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/   # Navbar, UploadZone, BeforeAfterSlider, Toast
│   │   ├── context/      # AuthContext (JWT state)
│   │   ├── hooks/        # useToast
│   │   ├── pages/        # Login, Signup, Dashboard
│   │   └── utils/        # api.js (axios instance)
│   ├── .env.example
│   └── vercel.json
│
├── server/               # Node.js + Express backend
│   ├── routes/           # /auth, /upload, /remove-bg
│   ├── middleware/        # auth.js (JWT verify)
│   ├── utils/            # userStore.js (JSON file DB)
│   ├── uploads/          # Processed images (local storage)
│   ├── data/             # users.json (auto-created)
│   ├── index.js
│   └── .env.example
│
└── render.yaml           # Render deployment config
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- A [remove.bg API key](https://www.remove.bg/api#remove-background-api) (free tier: 50 API calls/month)

---

### 1. Clone / Download the Project

```bash
cd removebg-pro
```

---

### 2. Setup the Backend (Server)

```bash
cd server
npm install
```

Create the `.env` file:
```bash
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
CLIENT_URL=http://localhost:5173
DEFAULT_CREDITS=5
```

> 💡 Get your free remove.bg API key at https://www.remove.bg/dashboard#api-key

Start the server:
```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

Server runs at: **http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/api/health
# → { "status": "ok", "message": "RemoveBG Pro API is running 🚀" }
```

---

### 3. Setup the Frontend (Client)

Open a **new terminal**:

```bash
cd client
npm install
```

Create the `.env` file:
```bash
cp .env.example .env
```

Edit `client/.env`:
```env
# In development, Vite proxies /api → localhost:5000 automatically.
# Leave VITE_API_URL empty for local dev:
VITE_API_URL=
```

Start the dev server:
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 4. Test the App Locally

1. Open http://localhost:5173
2. Click "Create Free Account" and sign up
3. You start with **5 free credits**
4. Upload any image (JPG, PNG, WebP, max 12 MB)
5. Click "Remove Background"
6. Use the before/after slider to compare
7. Download the result PNG

---

## 🌐 Production Deployment

### Frontend → Vercel

1. Push the `client/` folder to GitHub (or the whole monorepo)

2. Go to [vercel.com](https://vercel.com) → New Project → Import repo

3. Set **Root Directory** to `client`

4. Add environment variable:
   ```
   VITE_API_URL = https://your-render-backend.onrender.com/api
   ```

5. Deploy! Vercel auto-detects Vite.

---

### Backend → Render

**Option A — Using render.yaml (automatic)**

1. Push entire repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render reads `render.yaml`
4. Set secret env vars in the Render dashboard:
   - `REMOVE_BG_API_KEY` → your remove.bg API key
   - `CLIENT_URL` → your Vercel frontend URL (e.g. `https://removebg-pro.vercel.app`)

**Option B — Manual**

1. Render → New Web Service → Connect GitHub repo
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add all env vars from `server/.env.example`

> ⚠️ **Note:** Render free tier spins down after inactivity. The first request after idle takes ~30 seconds.

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login + get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/upload` | ✅ | Upload original image |
| POST | `/api/remove-bg` | ✅ | Remove background (costs 1 credit) |
| DELETE | `/api/remove-bg/cleanup` | ✅ | Delete temp files |
| GET | `/api/health` | ❌ | Server health check |

---

## 🧩 Features

- ✅ JWT Authentication (signup / login / logout)
- ✅ Protected routes
- ✅ Drag & drop image upload
- ✅ Image preview before processing
- ✅ Background removal via remove.bg API
- ✅ Before/after comparison slider
- ✅ One-click PNG download
- ✅ Credits system (5 free credits per user)
- ✅ Toast notifications
- ✅ Error handling (API errors, invalid files, large files, no credits)
- ✅ Responsive light UI (mobile + desktop)
- ✅ Vercel + Render deployment ready

---

## 🔧 Customisation

### Change free credits per user
Edit `server/.env`:
```env
DEFAULT_CREDITS=10
```

### Switch to MongoDB (production)
Replace `server/utils/userStore.js` with Mongoose models.
Install: `npm install mongoose`
Add `MONGODB_URI` to your `.env`.

### Add Cloudinary storage
Replace local disk storage in `routes/removebg.js` with Cloudinary upload:
```bash
npm install cloudinary
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `REMOVE_BG_API_KEY` error | Set the key in `server/.env` |
| CORS error in browser | Set `CLIENT_URL` correctly in server `.env` |
| 402 from remove.bg | You've run out of remove.bg API credits |
| Images not showing | Ensure server is running on port 5000 |
| Login loop | Clear localStorage in browser DevTools |

---

## 📄 License

MIT — Free to use, modify, and deploy.

# 🎓 Campus Match

> A private college-exclusive matchmaking platform. Anonymous likes, mutual matches, real connections.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Verified Student Onboarding** | Register number checked against admin-uploaded CSV database |
| 👀 **Anonymous Likes** | Identity hidden until mutual match |
| 💜 **Match System** | Animated popup + confetti on mutual match |
| 💬 **Real-time Chat** | Firebase RTDB with typing indicators, seen status, online presence |
| 📱 **WhatsApp Integration** | One-tap WhatsApp deep links after matching |
| 🔄 **14-Day Match Cycles** | Auto-reset swipe history to keep ecosystem fresh |
| 🎭 **Confession Wall** | Anonymous campus social feed with admin moderation |
| 🔔 **Smart Notifications** | Categorized alerts — matches, likes, messages |
| 🛡️ **Admin Dashboard** | CSV registry upload, user management, analytics, confession moderation |
| 📊 **Analytics** | DAU, match rates, gender ratio, department breakdown |
| 🌄 **Cloudinary Storage** | Free image hosting for profile photos (25GB) |
| 📱 **PWA** | Installable, offline-capable, mobile-first design |

---

## 🔄 How It Works

```
Student Registration Flow
──────────────────────────
[Admin uploads CSV] → [Student visits /auth/verify]
         ↓                        ↓
  student_registry         [Register number validated]
  collection in Firestore          ↓
                              [Account created]
                                    ↓
                              [Profile setup]
                                    ↓
                               [Discover page]
                                    ↓
                              [Start swiping 🎯]


Swipe & Match Flow
──────────────────────────
[User A swipes LIKE on User B]
         ↓
  Swipe saved to Firestore (anonymous)
         ↓
  [User B receives anonymous notification]
         ↓
  [User B swipes LIKE back on User A]
         ↓
  [MUTUAL MATCH! 🎉]
         ↓
  Both get match popup with confetti
         ↓
  [Real-time chat unlocked]
         ↓
  [Optional: WhatsApp deep link]


Confession Wall Flow
──────────────────────────
[Student writes confession]
         ↓
  Saved to Firestore (pending approval)
         ↓
  [Admin reviews in /admin dashboard]
         ↓
  [Approved → visible to all students]
         ↓
  [Rejected → deleted]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animation | Framer Motion + CSS |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Authentication | Firebase Auth (Email/Password) |
| Database | Cloud Firestore |
| Real-time Chat | Firebase Realtime Database |
| Image Storage | Cloudinary (free tier: 25GB) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase account
- Cloudinary account (free)

### 1. Clone & Install

```bash
git clone https://github.com/abhijithukr/campus-match.git
cd campus-match
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → Create new project
2. Enable these services:
   - **Authentication** → Email/Password → Enable
   - **Firestore Database** → Start in production mode (asia-south1)
   - **Realtime Database** → Create in locked mode
3. **Project Settings** → **Your apps** → Add web app → Copy config

### 3. Set up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up (free)
2. **Settings** → **Upload** → **Upload presets** → **Add upload preset**
3. Set:
   - Name: `campus_match_unsigned`
   - Signing mode: **Unsigned**
   - Folder: `campus-match`

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

### 5. Deploy Firebase Rules

```bash
npm install -g firebase-tools
firebase login
firebase init   # select Firestore + Realtime Database
firebase deploy --only firestore:rules,database
```

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Upload Student Registry

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. **Registry** tab → Upload your CSV

```csv
register_number,name,department,gender,year
CS21B001,Aisha Kumar,Computer Science,female,3
CS21B002,Rohan Verma,Electronics,male,2
ME22B010,Priya Nair,Mechanical,female,1
```

---

## 📁 Project Structure

```
campus-match/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                  # Root layout + fonts
│   ├── providers.tsx              # React Query + Auth listener
│   ├── auth/
│   │   ├── login/page.tsx         # Email/password sign in
│   │   ├── signup/page.tsx        # Multi-step registration
│   │   └── verify/page.tsx        # Register number verification
│   ├── (app)/
│   │   ├── layout.tsx             # Sidebar + auth guard + notifications
│   │   ├── discover/page.tsx      # Draggable swipe cards
│   │   ├── matches/page.tsx       # Match grid + conversations
│   │   ├── chat/page.tsx          # Real-time Discord-style chat
│   │   ├── confessions/page.tsx   # Anonymous wall + likes
│   │   ├── notifications/page.tsx # Categorized alerts
│   │   └── profile/page.tsx       # Edit profile + settings
│   └── admin/page.tsx             # Admin dashboard (4 tabs)
├── components/animations/
│   └── MatchPopup.tsx             # Confetti match celebration
├── firebase/
│   ├── config.ts                 # Firebase init
│   ├── auth.ts                   # Auth + profile management
│   ├── swipes.ts                 # Swipe engine + mutual matching
│   ├── chat.ts                   # RTDB chat + typing + presence
│   ├── confessions.ts             # Confession CRUD
│   ├── notifications.ts          # Real-time notifications
│   ├── storage.ts               # Cloudinary upload
│   └── admin.ts                  # CSV upload + analytics
├── store/
│   ├── useAuthStore.ts           # Zustand auth state
│   └── useAppStore.ts            # App-wide state (matches, etc.)
├── types/index.ts                # TypeScript interfaces
├── styles/globals.css            # Design tokens + utilities
├── firestore.rules               # Firestore security rules
├── database.rules.json           # RTDB security rules
└── public/manifest.json          # PWA manifest
```

---

## 🗄️ Data Schema (Firestore)

### `users/{uid}`
```ts
{ uid, fullName, registerNumber, email, gender, department, year,
  bio, profilePhoto, coverPhoto, interests, personalityTags,
  musicTaste, favoriteMovie, instagram, whatsappNumber,
  relationshipGoal, online, lastSeen, featuredToday,
  profileCompletion, likesRemaining, lastLikeReset, createdAt,
  privacySettings, notifSettings }
```

### `student_registry/{registerNumber}`
```ts
{ name, department, gender, year, activated, userId }
```

### `swipes/{fromUserId_toUserId}`
```ts
{ fromUser, toUser, type: 'like'|'skip', createdAt, expiresAt }
```

### `matches/{uid1_uid2}`
```ts
{ users: [uid1, uid2], createdAt, lastInteraction, active }
```

### `confessions/{id}`
```ts
{ authorId, text, department, year, likes, likedBy, comments, approved, createdAt }
```

### `notifications/{id}`
```ts
{ userId, type: 'match'|'anonymous_like'|'message'|'cycle_reset'|'featured',
  title, body, read, matchId?, createdAt }
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in **Vercel Dashboard → Settings → Environment Variables**.

Your site will be live at: `https://your-project.vercel.app`

---

## 🎨 Design System

```css
--bg:        #0B0B0F  /* Main background */
--surface:   #131318  /* Card backgrounds */
--surface2:  #1A1A22  /* Input backgrounds */
--purple:    #8A2BE2  /* Primary brand color */
--purple-light: #b78fff
--pink:      #FF4FD8  /* Accent color */
--text:      #F0EEF8  /* Primary text */
--muted:     #7A7890  /* Secondary text */
--grad:      linear-gradient(135deg, #8A2BE2, #FF4FD8)
```

Fonts: **Syne** (headings) + **DM Sans** (body)

---

## ⚡ Building for Production

```bash
npm run build    # Compiles and optimizes
npm run start    # Starts production server
npm run lint     # Lint check
```

---

## 🔒 Security Notes

- Register numbers are validated against admin-uploaded registry — students cannot fake their identity
- Swipe data is only visible to the two users involved
- Confessions require admin approval before going live
- Privacy settings control profile visibility, anonymous likes, and online status
- Environment variables (`.env.local`) are excluded from GitHub — never commit real API keys

---

## 📄 License

MIT License — built for campuses everywhere 🎓

---

Built with 💜 by [abhijithukr](https://github.com/abhijithukr)
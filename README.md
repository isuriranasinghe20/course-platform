# 🎓 EduGuide Portal — Full Stack Course Platform

A full-stack MERN (MongoDB, Express, React, Node.js) course management platform built as part of a Full Stack Developer assessment. It supports **role-based access** for students and instructors, course CRUD, enrollment management, and **GPT-powered course recommendations**.

## 🔗 Live Links

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://course-platform-l1sw5lvdi-isuriranasinghe20.vercel.app/ |
| **Backend API (Render)** | https://course-platform-r3x6.onrender.com |
| **GitHub Repository** | https://github.com/isuriranasinghe20/course-platform.git |
| **Demo Video** | [Watch on YouTube](https://youtu.be/P2_mAfPT2Dk) 

> ⚠️ **Note on backend cold starts:** The backend is hosted on Render's free tier, which sleeps after 15 minutes of inactivity. The first request may take ~30 seconds to wake up. Please refresh if the initial login appears slow.

---

## 📑 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Database Schema](#-database-schema)
5. [API Endpoints](#-api-endpoints)
6. [GPT Integration](#-gpt-integration)
7. [Local Development Setup](#-local-development-setup)
8. [Deployment](#-deployment)
9. [GPT API Request Log](#-gpt-api-request-log)
10. [Known Issues](#-known-issues)
11. [Author](#-author)

---

## ✨ Features

### 👨‍🎓 Student Features
- **Authentication:** Sign up and login with JWT-based sessions
- **Browse Courses:** View all available courses with details
- **Enroll:** One-click enrollment with duplicate prevention
- **My Courses:** View personalized list of enrolled courses with status
- **AI Recommendations:** Enter a goal (e.g. *"I want to be a software engineer"*) and receive GPT-powered course suggestions

### 👩‍🏫 Instructor Features
- **Authentication:** Sign up and login with JWT-based sessions
- **Course Management:** Create, read, update, and delete own courses
- **Enrolled Students:** View a table of students enrolled in each course
- **Ownership Enforcement:** Instructors can only edit/delete their own courses

### 🔒 Security & Access Control
- **JWT-based authentication** with 7-day expiry
- **Role-Based Access Control (RBAC)** — separate permissions for students and instructors
- **Password hashing** with bcrypt (10 rounds)
- **Protected routes** on both frontend and backend
- **Rate limiting** on GPT endpoint (5 req/min/user)

## 📸 Screenshots

### Login & Register
![Login Page](docs/screenshots/01-login.png)

### Instructor Dashboard — Course Management & Enrolled Students
![Instructor Dashboard](docs/screenshots/02-instructor-dashboard.png)

### Student — Course Listing 
![Enrollment Success](docs/screenshots/03-enrollment.png)

### Student — Enrolled Courses
![My Courses](docs/screenshots/04-my-courses.png)

### AI Course Recommendations (GPT Integration)
![GPT Recommendations](docs/screenshots/05-recommendations.png)

### Instructor — Courses
![My Courses](docs/screenshots/06-course-instructor.png)

### Instructor — Enrolled Courses
![My Courses](docs/screenshots/07-course-student.png)


---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — Database and ODM
- **JWT** (jsonwebtoken) — Authentication
- **bcryptjs** — Password hashing
- **OpenAI SDK** — GPT integration
- **express-rate-limit** — Rate limiting
- **dotenv** — Environment config
- **CORS** — Cross-origin handling

### Frontend
- **React.js** (Create React App)
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with interceptors
- **Context API** — Auth state management
- **Custom CSS** — Responsive, modern UI

### DevOps
- **GitHub** — Version control
- **Render** — Backend hosting
- **Vercel** — Frontend hosting
- **MongoDB Atlas** — Cloud database

---

## 🏗 Architecture

```
┌────────────────────┐        ┌────────────────────┐        ┌────────────────────┐
│   React Frontend   │ ─────► │  Express Backend   │ ─────► │   MongoDB Atlas    │
│  (Vercel - CRA)    │  REST  │   (Render - Node)  │        │  (Users, Courses,  │
│                    │  API   │                    │        │   Enrollments)     │
└────────────────────┘        └─────────┬──────────┘        └────────────────────┘
                                        │
                                        │ OpenAI API
                                        ▼
                              ┌────────────────────┐
                              │  GPT-3.5 Turbo     │
                              │ (recommendations)  │
                              └────────────────────┘
```

### Folder Structure

```
course-platform/
├── backend/
│   ├── config/           # DB connection
│   ├── controllers/      # Business logic (auth, course, enrollment, gpt)
│   ├── middleware/       # Auth, RBAC, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── utils/            # Token generator, GPT request counter
│   ├── .env.example      # Env template
│   └── server.js         # Entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── api/          # Axios instance
        ├── components/   # Navbar, ProtectedRoute, CourseCard
        ├── context/      # AuthContext
        ├── pages/        # Login, Register, Courses, etc.
        └── App.js
```

---

## 🗄 Database Schema

### User
```js
{
  _id: ObjectId,
  username: { type: String, required: true, unique: true, minlength: 3 },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'instructor'], required: true },
  createdAt: Date,
  updatedAt: Date
}
```

### Course
```js
{
  _id: ObjectId,
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  content: { type: String, default: '' },
  category: { type: String, default: 'General' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  instructor: { type: ObjectId, ref: 'User', required: true },
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment
```js
{
  _id: ObjectId,
  student: { type: ObjectId, ref: 'User', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['enrolled', 'completed'], default: 'enrolled' },
  enrolledAt: { type: Date, default: Date.now }
}
```

**Compound Index:** `{ student: 1, course: 1 }` unique — prevents duplicate enrollment.

---

## 🔌 API Endpoints

Base URL: `https://course-platform-r3x6.onrender.com/api`

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register (student or instructor) |
| POST | `/auth/login` | Public | Login → returns JWT |
| GET | `/auth/me` | Private | Get current user |

### Courses
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/courses` | Private | List all courses |
| GET | `/courses/:id` | Private | Course details |
| POST | `/courses` | Instructor | Create a course |
| PUT | `/courses/:id` | Instructor (owner) | Update a course |
| DELETE | `/courses/:id` | Instructor (owner) | Delete a course |
| GET | `/courses/instructor/mine` | Instructor | Get own courses |

### Enrollments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/enrollments/:courseId` | Student | Enroll in a course |
| GET | `/enrollments/my` | Student | List my enrollments |
| GET | `/enrollments/course/:courseId` | Instructor (owner) | List students in a course |

### GPT Recommendations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/gpt/recommend` | Student | Get AI course recommendations |
| GET | `/gpt/usage` | Private | Get request counter stats |

### Example Request
```http
POST /api/gpt/recommend
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "prompt": "I want to be a software engineer, what courses should I follow?"
}
```

### Example Response
```json
{
  "recommendations": [
    {
      "_id": "650f...",
      "title": "Intro to JavaScript",
      "description": "Learn JS basics",
      "category": "Programming",
      "level": "beginner",
      "reason": "Builds foundational skills for software engineering"
    }
  ],
  "totalRequestsMade": 5,
  "maxRequests": 250,
  "mode": "mock"
}
```

---

## 🤖 GPT Integration

The GPT integration is implemented in `backend/controllers/gptController.js` using the OpenAI Node SDK (`gpt-3.5-turbo`).

### How It Works
1. Student submits a natural-language prompt via `/api/gpt/recommend`
2. Backend fetches the course catalog from MongoDB (**single DB query, no loops**)
3. The catalog is sent as context in **one** GPT call
4. GPT returns a JSON array of recommended course IDs with reasons
5. Backend enriches with course details and returns to frontend

### Safeguards per Assessment Rules
- ✅ **Max 250 requests** enforced via `utils/gptRequestCounter.js`
- ✅ **No API calls in loops** — one call per recommendation request
- ✅ **Rate limiting** — 5 requests per minute per user
- ✅ **Graceful error handling** for 401, 429, and quota errors
- ✅ **Request logging** exposed via `GET /api/gpt/usage`

### Mock Mode
To keep the application fully demonstrable while the assessment API key is being validated, the GPT endpoint can run in **mock mode**:

```env
USE_REAL_GPT=false   # mock mode (keyword matching)
USE_REAL_GPT=true    # live GPT mode (requires valid key)
```

The mock returns the same response shape as live GPT, so the frontend requires **no code changes**. This is documented as a limitation (see Known Issues below).

---

## 💻 Local Development Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/isuriranasinghe20/course-platform.git
cd course-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/course-platform
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_key_here
USE_REAL_GPT=false
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```
Runs on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```
Opens at `http://localhost:3000`

### 4. Test the App
1. Register as **instructor** → create a course
2. Logout → register as **student** → enroll in the course
3. Go to **My Courses** → see enrolled course
4. Go to **Recommend** → test GPT suggestions

---

## 🚀 Deployment

### Backend — Render
1. Create **New Web Service** → connect GitHub repo
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add environment variables (same as `.env` above, with production values)
6. MongoDB Atlas → Network Access → allow `0.0.0.0/0`

### Frontend — Vercel
1. Import GitHub repo → **Root Directory:** `frontend`
2. Framework: **Create React App**
3. Environment variable:
   - `REACT_APP_API_URL` = `https://course-platform-r3x6.onrender.com/api`
   - Type: **Config** (not Secret)
4. Deploy

### CORS
Backend uses `cors()` to allow cross-origin requests from the Vercel domain.

---

## 📊 GPT API Request Log

Total GPT API requests made during development and testing:

**`GPT_REQUESTS_MADE` 4 / 250**

Query this anytime with:
```bash
curl https://course-platform-r3x6.onrender.com/api/gpt/usage \
  -H "Authorization: Bearer <your_jwt>"
```

---

## ⚠️ Known Issues

### 1. GPT API Key Returns 401

The API key provided in the assessment PDF returns `401 invalid_api_key` on every request. This was verified **outside the application** using `curl`, ruling out any code issue:

```powershell
$key = "sk-proj-..."
curl.exe https://api.openai.com/v1/models -H "Authorization: Bearer $key"

# Response:
# { "error": { "message": "Incorrect API key provided", "code": "invalid_api_key" } }
```

**Verification steps performed:**
- ✅ Key stored intact in `.env` — no truncation, single line, no quotes
- ✅ No `l`/`1` or `O`/`0` PDF-copy substitutions
- ✅ Key loaded correctly into the Node process (verified via debug endpoint)
- ✅ Key tested with `curl` outside the app — same 401

**Action taken:** Assessment coordinator contacted on **2026-09-19** to request a replacement key.

**Fallback:** The GPT endpoint runs in **mock mode** by default (see [Mock Mode](#mock-mode) above) so the full user flow remains demonstrable. Once a valid key is provided, set `USE_REAL_GPT=true` in the environment and restart — no code changes required.

### 2. Render Free Tier Cold Starts

The backend sleeps after 15 minutes of inactivity. The first request after sleep may take ~30 seconds. This is a limitation of the free tier and not a bug.

---

## 👤 Author

**YOUR_NAME**
- GitHub: [isuriranasinghe20](https://github.com/isuriranasinghe20)
- Email: isuriranasinghe70@gmail.com

Completed as part of a Full Stack Developer assessment — **2026-09-19**.

---

## 📄 License

This project was created for educational and assessment purposes.
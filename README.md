<div align="center">

# ✨ SmartMatch AI

**Enterprise-Grade AI-Powered Resume Analyzer & ATS Matching Platform**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)

SmartMatch AI bridges the gap between job seekers and recruiters. By combining **deterministic ATS scoring** with **LLM-powered resume parsing (Llama 3.3)** and **TF-IDF cosine similarity**, it delivers transparent, explainable, and highly accurate resume-to-job matching.

[Explore Features](#-key-features) · [How It Works](#-how-it-works-the-engine) · [Quick Start](#-quick-start) · [API Docs](#-api-reference)

</div>

---

## 📖 About The Project

Traditional Applicant Tracking Systems (ATS) are often black boxes, leaving candidates confused about why their resume was rejected. SmartMatch AI solves this by providing a **transparent, 5-dimensional scoring algorithm** combined with generative AI to explain exactly *why* a candidate matches a job role and *how* they can improve.

It features two distinct portals:
- 🎓 **Student Portal**: For job seekers to analyze their resumes, view skill gaps, and find matching jobs.
- 🏢 **Recruiter Portal**: For HR admins to post jobs, manage candidate pools, and get AI-driven applicant insights.

---

## ✨ Key Features

### 🎓 For Students (Job Seekers)
- **📄 AI Resume Analyzer**: Drag-and-drop PDF upload. Extracts skills, experience, and education with 95%+ accuracy.
- **🎯 Smart Job Matching**: Matches your profile against open positions using NLP (TF-IDF cosine similarity).
- **📊 Rich Analytics**: Visualizes your strengths and skill gaps using interactive Recharts (Radar & Bar charts).
- **💡 AI Actionable Feedback**: Get LLM-generated suggestions on how to improve your specific resume.

### 🏢 For Recruiters (Admins)
- **📈 Global Dashboard**: Real-time platform analytics, job demand charts, and match quality distributions.
- **📋 Job Management**: Post, edit, and manage job listings with required skills targeting.
- **👥 Smart Candidate Pool**: Browse applicants, filter by status (Shortlisted, Interviewed), and view AI summaries of their strengths.
- **📥 One-Click Export**: Export the entire candidate pipeline to CSV for external reporting.
- **🔒 Secure Access**: Invite-code protected registration ensures only authorized recruiters can access the portal.

---

## 🧠 How It Works: The Engine

SmartMatch AI doesn't just guess; it uses a transparent pipeline:

1. **Extraction**: `pdf-parse` extracts raw text from uploaded PDFs.
2. **Structuring**: Groq's **Llama 3.3 70B** model parses the raw text into structured JSON (Skills, Experience, Education).
3. **Scoring**: A deterministic algorithm calculates an ATS score based on 5 dimensions:
   - **Skills (40%)**: Quantity, diversity, and relevance of hard/soft skills.
   - **Experience (25%)**: Years of experience, structured bullet points, action verbs.
   - **Keywords (15%)**: Density and frequency of industry-standard terms.
   - **Education (10%)**: Degree hierarchy and institutional data.
   - **Quality (10%)**: Formatting, length, and section completeness.
4. **Matching**: **TF-IDF vectorization** and **Cosine Similarity** compare the candidate's structured profile against job descriptions to generate a percentage match.

---

## 🛠️ Tech Stack

**Frontend Architecture:**
- **Framework**: React 18 with TypeScript (built with Vite for lightning-fast HMR)
- **Styling**: TailwindCSS with a custom Glassmorphism dark-theme design system
- **Components**: Lucide React (Icons), Recharts (Data Visualization)
- **Routing**: React Router DOM v6

**Backend Architecture:**
- **Server**: Node.js & Express.js
- **Database**: SQLite3 via `better-sqlite3` (WAL mode enabled for high concurrency)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt (12 salt rounds)
- **AI Integration**: Groq SDK (Llama 3.3 70B Versatile)
- **Validation**: Zod schema validation for robust API boundaries

---

## 🚀 Quick Start

Follow these steps to get a local copy up and running.

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A free [Groq API Key](https://console.groq.com/keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyanshusingh0818/resume-matching.git
   cd resume-matching
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```
   > **Note for Windows Users**: `better-sqlite3` requires C++ build tools. If installation fails, run `npm install --global windows-build-tools` first.

4. **Configure Environment Variables**
   Create a `.env` file in the `backend/` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Populate it with your keys:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   GROQ_API_KEY=your_groq_api_key_here
   ADMIN_INVITE_CODE=SMARTMATCH2024
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```
   
   Create a `.env` file in the root directory:
   ```bash
   cd ..
   cp .env.example .env
   ```
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the Application**
   From the root directory, run the following command to start both the frontend and backend concurrently:
   ```bash
   npm start
   ```

   - Frontend is now running at: `http://localhost:5173`
   - Backend API is running at: `http://localhost:5000`

---

## 📡 API Reference

The backend provides a comprehensive REST API. All protected routes require a `Bearer <token>` in the Authorization header.

### Authentication
- `POST /api/auth/register` - Register a new user (Requires `invite_code` for admins)
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Validate token and get current user profile
- `PUT /api/auth/password` - Update password securely

### Resumes & AI
- `POST /api/resume/upload` - Upload PDF, parse, and get ATS score
- `GET /api/resume` - Retrieve user's latest parsed resume data
- `GET /api/resume/improvements` - Stream LLM-generated improvement suggestions

### Job Matching
- `POST /api/matches/generate` - Run the TF-IDF engine to find matching jobs
- `GET /api/matches/:id/explanation` - Get LLM explanation of why a job is/isn't a fit

### Admin Operations
- `POST /api/jobs` - Create a new job posting
- `GET /api/admin/stats` - Get platform-wide analytics
- `GET /api/admin/resumes` - View all candidate profiles
- `GET /api/admin/export/candidates` - Download CSV report of the talent pool

---

## 🏗️ Project Structure

```text
resume-matching/
├── backend/                  # Express.js Server
│   ├── config/               # App configuration & constants
│   ├── controllers/          # Route logic (Auth, Resume, Match, Admin)
│   ├── middleware/           # JWT Auth & Rate Limiting
│   ├── models/               # SQLite Database access methods
│   ├── routes/               # API endpoint definitions
│   ├── services/             # Core Logic: AI, Parsing, Scoring Engine
│   ├── utils/                # NLP tools (TF-IDF, Text Normalizer)
│   └── db.js                 # SQLite schema initialization
├── components/               # React UI Components
│   ├── admin/                # Recruiter portal views
│   ├── auth/                 # Login & Registration flows
│   ├── shared/               # Reusable UI (Sidebar, Header, Cards)
│   └── student/              # Job seeker portal views
├── context/                  # React Context (Auth State)
├── services/                 # Frontend API Client (api.ts)
├── App.tsx                   # Main React Router setup
└── tailwind.config.js        # Custom design system tokens
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ by Priyanshu Singh</b><br>
  <a href="https://github.com/Priyanshusingh0818">GitHub</a>
</div>

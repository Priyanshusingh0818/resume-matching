# SmartMatch AI

An advanced Resume Parsing and Job Matching platform powered by a robust Express/SQLite backend and a stunning, highly animated React + Vite frontend.

## Features
- **AI Resume Parsing:** Leverages Groq API to extract skills and experience instantly from student resumes.
- **Algorithmic Job Matching:** Iterates over the global job database map and yields a comprehensive skill correlation index.
- **Dynamic Dashboards:** Implements granular cross-joined SQLite aggregation queries to visualize algorithmic footprints without reliance on any mock frontend constants.
- **Admin System:** Complete global oversight pooling metrics from recent candidates matching their ATS extraction scores precisely.

## Environment Configuration
You must configure environment variables to run the application securely.

Create an `.env` file in the `backend/` directory:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
```

Create an `.env` file in the root `resume-matching-main/` directory:
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application Locally

The primary way to start both the Frontend and Backend simultaneously is to run:

```bash
npm install
npm start
```
This leverages `concurrently` to spin up both engines synchronously out of a unified terminal.

### Alternatively, Run Independently

#### 1. Database & Backend Engine (Node.js)
Open a terminal in the `./backend/` directory.

Run installation:
```bash
npm install
```

Start the backend:
```bash
node server.js
```
The server will boot on `http://localhost:5000` assuming default parameters. (It will auto-initialize SQLite `.db` schemas safely on launch).

### 2. Frontend Visuals (React/Vite)
Open a separate terminal in the root `./` directory.

Run installation:
```bash
npm install
```

Launch the Vite client:
```bash
npm run dev
```
Navigate to the provided Local IP to view the Live System. Default login redirects to `/student/login`.

## Security 
Administrative endpoints (`/api/admin/*`, `/api/jobs` via POST) are locked natively via JWT payload inspections confirming Role arrays. Only manually vetted admins bypass standard boundaries.

Enjoy!

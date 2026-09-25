# CareerConnect

A full-stack Career / Job Application Portal built with React, Node.js, Express and MongoDB.

## Folder structure

```
careerconnect/
├── client/   → React + Vite + Tailwind frontend
└── server/   → Node.js + Express + Mongoose backend
```

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

You can use a free MongoDB Atlas cluster, or a local MongoDB instance
(`mongodb://127.0.0.1:27017/careerconnect`).

Run the server:

```bash
npm run dev
```

The API will start at `http://localhost:5000`.

## 2. Frontend setup

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

The default `.env` already points to `http://localhost:5000/api`, which
matches the backend above.

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 3. Try it out

**As a candidate:**
1. Go to Home → click "Explore Careers".
2. Pick a job card → "Apply Now".
3. Fill the 4-step form (Personal → Education → Skills → Review).
4. Click "Submit Application" — it's saved to MongoDB via `POST /api/applications`.

**As an admin:**
1. Go to `/login`.
2. Sign in with:
   - Email: `admin@gmail.com`
   - Password: `admin@123`
3. View the Dashboard (application counts) and Applications table (`GET /api/applications`).
4. Click "View" on any row to see full applicant details.

## Notes

- Admin login is handled on the frontend with a hardcoded demo account and
  a simple `localStorage` token — no extra auth API was added, keeping the
  backend limited to the two required endpoints (`POST` and `GET` on
  `/api/applications`), as specified.
- The Register page is a simple candidate sign-up form for the UI flow; it
  does not persist accounts to MongoDB since only applications are part of
  the data model.
- No Axios or third-party job APIs are used — all HTTP calls use the native
  `fetch` API.

# Company-wise DSA Sheet — Backend API

A production-quality REST API for a Company-wise DSA preparation platform, built with Node.js, Express.js, and MongoDB.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Installation & Running Locally](#5-installation--running-locally)
6. [Database Setup & Seeding](#6-database-setup--seeding)
7. [Authentication](#7-authentication)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Example API Requests & Responses](#9-example-api-requests--responses)
10. [Architecture Decisions](#10-architecture-decisions)

---

## 1. Project Overview

This backend powers a Developer Interview Preparation platform where users can:

- Browse DSA problems organized by company (Google, Amazon, Microsoft, etc.)
- Filter problems by difficulty, topic, or search by title/LeetCode ID
- Sort problems by frequency, acceptance rate, difficulty
- Track solving progress (not started / attempted / solved)
- Add personal notes to problems
- View dashboard statistics and company-wise progress

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| Node.js (v18+) | Runtime |
| Express.js | HTTP framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| helmet | Security headers |
| cors | Cross-origin resource sharing |
| morgan | HTTP request logging |
| express-rate-limit | Rate limiting |
| slugify | URL slug generation |
| dotenv | Environment variable management |

---

## 3. Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment config + validation
│   │
│   ├── controllers/           # HTTP layer — handles req/res only
│   │   ├── auth.controller.js
│   │   ├── company.controller.js
│   │   ├── problem.controller.js
│   │   └── progress.controller.js
│   │
│   ├── middleware/            # Reusable Express middleware
│   │   ├── auth.middleware.js     # JWT protect + restrictTo(role)
│   │   ├── error.middleware.js    # Centralised error handler + 404
│   │   ├── validate.middleware.js # express-validator error collector
│   │   └── rateLimit.middleware.js# General + auth rate limiters
│   │
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Problem.js
│   │   └── UserProgress.js
│   │
│   ├── routes/                # Route definitions (no business logic)
│   │   ├── auth.routes.js
│   │   ├── company.routes.js
│   │   ├── problem.routes.js
│   │   ├── progress.routes.js
│   │   └── admin.routes.js
│   │
│   ├── services/              # Business logic layer
│   │   ├── auth.service.js
│   │   ├── company.service.js
│   │   ├── problem.service.js
│   │   └── progress.service.js
│   │
│   ├── utils/
│   │   ├── generateToken.js   # JWT token generator
│   │   └── apiResponse.js     # sendSuccess, sendError, buildPagination
│   │
│   ├── seed/
│   │   └── seed.js            # Database seeder script
│   │
│   ├── app.js                 # Express app (middleware + routes)
│   └── server.js              # HTTP server entry point
│
├── .env                       # Local environment (do not commit)
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/company-dsa-sheet
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port the server listens on (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `CLIENT_URL` | No | CORS allowed origin (React frontend URL) |
| `NODE_ENV` | No | `development` or `production` |

---

## 5. Installation & Running Locally

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Steps

```bash
# 1. Clone and enter the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Seed the database
npm run seed

# 5. Start the development server
npm run dev
```

The API will be available at `http://localhost:5000/api`

---

## 6. Database Setup & Seeding

### Local MongoDB

Ensure MongoDB is running:
```bash
mongod --dbpath /data/db
```

### MongoDB Atlas

Set `MONGODB_URI` to your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/company-dsa-sheet
```

### Seeding

```bash
npm run seed
```

This seeds:
- **10 companies**: Google, Amazon, Microsoft, Meta, Apple, Adobe, Uber, Netflix, Flipkart, Atlassian
- **30 realistic DSA problems** associated with multiple companies
- **1 admin user**: `admin@dsasheet.com` / `admin123456`

> ⚠️ The seed script clears existing companies, problems, and admin users before re-seeding.

---

## 7. Authentication

The API uses **JWT Bearer token** authentication.

### Flow

1. Register or login to receive a JWT token
2. Include the token in subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```
3. Token expires per `JWT_EXPIRES_IN` (default: 7 days)
4. Logout is client-side — discard the token

### Protected Routes

All `/api/progress/*` and `/api/dashboard` routes require authentication.
All `/api/admin/*` routes require authentication **and** `role: "admin"`.

---

## 8. API Endpoints Reference

### Health Check

```
GET /health
```

### Auth Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Login |
| POST | `/api/auth/logout` | Required | Logout |
| GET | `/api/auth/me` | Required | Get current user |

### Company Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/companies` | None | List all companies |
| GET | `/api/companies/:slug` | None | Get company details |
| GET | `/api/companies/:slug/problems` | None | Get company problems |

**Query Parameters for `/api/companies/:slug/problems`:**

| Param | Type | Values | Default | Description |
|---|---|---|---|---|
| `page` | number | ≥1 | 1 | Page number |
| `limit` | number | 1-100 | 20 | Items per page |
| `difficulty` | string | Easy/Medium/Hard | — | Filter by difficulty |
| `search` | string | — | — | Search by title or LeetCode ID |
| `topic` | string | — | — | Filter by topic |
| `sort` | string | frequency/difficulty/acceptanceRate/title/leetcodeId | frequency | Sort field |
| `order` | string | asc/desc | desc | Sort direction |

### Problem Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/problems` | None | List problems (with filters) |
| GET | `/api/problems/:id` | None | Get single problem (by ObjectId or leetcodeId) |
| GET | `/api/problems/:id/companies` | None | Get companies for problem |

**Query Parameters for `/api/problems`:**

Same as company problems, plus:

| Param | Type | Description |
|---|---|---|
| `company` | string | Filter by company slug |

### Progress Routes (All require authentication)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/progress` | Get all user progress |
| GET | `/api/progress/:problemId` | Get progress for a problem |
| POST | `/api/progress/:problemId` | Create/update progress |
| PATCH | `/api/progress/:problemId` | Update progress |
| DELETE | `/api/progress/:problemId` | Delete progress record |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Required | Get user stats + company progress |

### Admin Routes (Require admin role)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/companies` | Create company |
| PATCH | `/api/admin/companies/:id` | Update company |
| DELETE | `/api/admin/companies/:id` | Delete company |
| POST | `/api/admin/problems` | Create problem |
| PATCH | `/api/admin/problems/:id` | Update problem |
| DELETE | `/api/admin/problems/:id` | Delete problem |

---

## 9. Example API Requests & Responses

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Sai",
  "email": "sai@example.com",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "6677abc123...",
      "name": "Sai",
      "email": "sai@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
}
```

### Get Company Problems

```http
GET /api/companies/google/problems?difficulty=Medium&sort=frequency&order=desc&page=1&limit=10
```

**Response 200:**
```json
{
  "success": true,
  "message": "Company problems fetched successfully.",
  "data": [...],
  "company": { "name": "Google", "slug": "google" },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Create/Update Progress

```http
POST /api/progress/6677abc123...
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "solved",
  "notes": "Used prefix sum approach. O(n) time, O(1) space."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Progress saved successfully.",
  "data": {
    "_id": "...",
    "status": "solved",
    "notes": "Used prefix sum approach. O(n) time, O(1) space.",
    "solvedAt": "2024-01-15T10:30:00.000Z",
    "problem": {
      "title": "Two Sum",
      "difficulty": "Easy",
      "leetcodeId": 1
    }
  }
}
```

### Dashboard

```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully.",
  "data": {
    "totalProblems": 30,
    "solvedProblems": 8,
    "attemptedProblems": 3,
    "remainingProblems": 19,
    "easySolved": 3,
    "mediumSolved": 4,
    "hardSolved": 1,
    "completionPercentage": 26.7,
    "companyProgress": [
      { "company": "Google", "slug": "google", "total": 18, "solved": 4, "percentage": 22.2 },
      { "company": "Amazon", "slug": "amazon", "total": 22, "solved": 5, "percentage": 22.7 }
    ]
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

## 10. Architecture Decisions

### Layered Architecture

The codebase follows a **Controller → Service → Model** pattern:

- **Routes** — wire HTTP methods to controllers and attach middleware chains
- **Controllers** — parse req/res, call services, return standardised responses via `apiResponse.js`
- **Services** — contain all business logic and database queries; completely ignorant of Express
- **Models** — define Mongoose schemas and database indexes

This means services are independently testable without spinning up an HTTP server.

### Error Handling Strategy

A centralised error handler in `error.middleware.js` catches all thrown errors and maps them to appropriate HTTP codes. Controllers simply call `next(error)` — there is no duplicated error handling logic.

### JWT Authentication

JWTs are stateless. The `protect` middleware verifies the token and re-fetches the user from the database (using `.lean()` for performance) to ensure the user still exists. Roles are embedded in the JWT payload for quick access without an extra DB call.

### Rate Limiting

Two rate limiters are configured:
- **General**: 100 requests / 15 min per IP — applied to all `/api/*` routes
- **Auth**: 10 requests / 15 min per IP — applied only to `/api/auth/register` and `/api/auth/login`

### Performance Optimisations

- `.lean()` is used on all read-only queries to return plain JS objects instead of Mongoose Documents
- `select('-description')` is used on list endpoints to avoid returning large description fields
- MongoDB indexes are defined on all filterable/sortable fields
- `Promise.all` is used to run count and data queries concurrently
- `.populate()` is used selectively with field projection (`name slug logo`)

### Security

- `helmet` sets 11+ security headers
- Body size is limited to 10kb to prevent payload attacks
- Passwords are hashed with bcrypt (12 salt rounds)
- Stack traces are never returned in production responses
- Environment variables are validated at startup

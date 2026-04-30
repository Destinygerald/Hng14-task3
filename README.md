# Insighta Labs+ — Stage 3

Secure Access & Multi-Interface Platform

---

## 📌 Overview

Insighta Labs+ is a backend-driven platform that provides:

- Profile intelligence (from external APIs)
- Advanced querying (filtering, sorting, pagination)
- Natural language search
- Secure authentication (GitHub OAuth + PKCE)
- Role-based access control (RBAC)
- Multi-interface access:
  - CLI tool
  - Web portal (Swagger UI + session-based pages)

---

## 🏗️ System Architecture

```
CLI  --------\
              \
Web Portal -----> Backend API -----> PostgreSQL
              /
Swagger UI ---/
```

- **Single source of truth:** Backend API
- CLI and Web share the same endpoints
- Data consistency across all interfaces

---

## 🔐 Authentication System

### OAuth Provider

GitHub OAuth with PKCE

### Flows

#### CLI Flow

1. `insighta login`
2. CLI generates:
   - `state`
   - `code_verifier`
   - `code_challenge`

3. Opens browser → GitHub login
4. GitHub redirects to backend callback
5. Backend:
   - Exchanges code
   - Retrieves user
   - Issues tokens

6. CLI stores:

```
~/.insighta/credentials.json
```

---

#### Web Flow

1. User clicks "Login with GitHub"
2. OAuth handled in browser
3. Backend creates session
4. HTTP-only cookie stored

---

## 🔑 Token Lifecycle

| Token         | Expiry    |
| ------------- | --------- |
| Access Token  | 3 minutes |
| Refresh Token | 5 minutes |

### Refresh Strategy

- Refresh token is **rotated on every use**
- Old token is **invalidated immediately**
- Expired tokens are rejected

---

## 👤 User Model

| Field         | Type            |
| ------------- | --------------- |
| id            | UUID            |
| github_id     | String          |
| username      | String          |
| email         | String          |
| avatar_url    | String          |
| role          | admin / analyst |
| is_active     | Boolean         |
| last_login_at | Timestamp       |

---

## 🔐 Role-Based Access Control

| Role    | Permissions |
| ------- | ----------- |
| admin   | Full access |
| analyst | Read-only   |

---

## ⚠️ API Requirements

### Version Header (Required)

All `/api/*` requests must include:

```
X-API-Version: 1
```

Missing header returns:

```json
{
  "status": "error",
  "message": "API version header required"
}
```

---

## 📡 API Routes

---

## 🔐 Auth Routes

### GET `/auth/github`

Redirects user to GitHub OAuth

---

### GET `/auth/github/callback`

Handles OAuth callback

**Response (CLI mode):**

```json
{
  "status": "success",
  "access_token": "string",
  "refresh_token": "string"
}
```

---

### POST `/auth/refresh`

**Request**

```json
{
  "refresh_token": "string"
}
```

**Response**

```json
{
  "status": "success",
  "access_token": "string",
  "refresh_token": "string"
}
```

---

### POST `/auth/logout`

Invalidates refresh token and session

---

### GET `/auth/whoami`

Returns current user

---

## 📊 Profile Routes

### GET `/api/profiles`

Supports:

- filtering
- sorting
- pagination

**Response**

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 100,
  "total_pages": 10,
  "links": {
    "self": "",
    "next": "",
    "prev": null
  },
  "data": []
}
```

---

### GET `/api/profiles/search?q=`

Natural language search

Example:

```
young males from nigeria
```

---

### GET `/api/profiles/:id`

Fetch single profile

---

### POST `/api/profiles` (Admin only)

Creates profile via external APIs

---

### GET `/api/profiles/export?format=csv`

Returns CSV file

Columns:

```
id, name, gender, gender_probability, age, age_group,
country_id, country_name, country_probability, created_at
```

---

## 🖥️ CLI Usage

### Install

```
npm install -g insighta-cli
```

---

### Commands

#### Auth

```
insighta login
insighta logout
insighta whoami
```

---

#### Profiles

```
insighta profiles:list
insighta profiles:search "young males from nigeria"
insighta profiles:create "Harriet Tubman"
insighta profiles:export
```

---

## 🌐 Web Portal

### Available Routes

| Route      | Description  |
| ---------- | ------------ |
| /login     | GitHub login |
| /dashboard | Metrics      |
| /account   | User info    |
| /docs      | Swagger UI   |

---

### Security

- HTTP-only cookies
- CSRF protection
- Session-based authentication

---

## ⚡ Rate Limiting

| Scope     | Limit      |
| --------- | ---------- |
| `/auth/*` | 10 req/min |
| `/api/*`  | 60 req/min |

---

## 📜 Logging

Logs per request:

- Method
- Endpoint
- Status code
- Response time

---

## 🧠 Natural Language Search

Uses keyword parsing:

Example:

```
"young males from nigeria"
```

Parsed into:

- age ≤ 25
- gender = male
- country = NG

---

## 🚀 Deployment

### Backend

- Render / Railway

### Database

- PostgreSQL (Neon / Supabase)

### CLI

- Local install

---

## 📁 Environment Variables

```
PORT=
DATABASE_URL=
SESSION_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## 🧪 Engineering Standards

- Conventional commits
- PR-based workflow
- GitHub Actions CI:
  - lint
  - tests
  - build

---

## ✅ System Guarantees

- Secure authentication
- Consistent data across interfaces
- Role-based access enforcement
- Token lifecycle integrity
- No regressions from Stage 2

---

## 📌 Summary

Insighta Labs+ transforms a data system into a:

- Secure
- Multi-user
- Multi-interface
- Production-ready platform

---

## 👨‍💻 Author

Insighta Backend Engineering Track — Stage 3

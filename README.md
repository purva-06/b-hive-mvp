# B HIVE MVP

> **A Git-inspired collaborative knowledge contribution platform built with the MERN stack.**

B HIVE enables collaborative improvement of knowledge through structured contribution requests instead of direct editing. Every registered user can publish their own articles and contribute improvements to articles owned by other users. Accepted contributions update the article while preserving complete version history.

---

# Project Status

> 🚧 **Backend Development Phase**

The current focus is building a production-style REST API before developing the React frontend.

---

# Problem Statement

Readers often identify opportunities to improve published content by:

- clarifying explanations
- correcting mistakes
- updating outdated information
- adding missing context
- improving structure
- fixing grammar and readability

Traditional publishing platforms provide comments but rarely support a structured workflow for proposing, reviewing, and merging revisions while preserving attribution and history.

B HIVE explores a Git-inspired workflow for collaborative knowledge creation.

---

# MVP Objective

The MVP validates one primary workflow:

1. A registered user publishes an article.
2. Another registered user discovers it.
3. They propose an improved version.
4. They explain why the change is useful.
5. The article owner reviews the proposal.
6. The owner accepts, rejects, or requests changes.
7. Accepted contributions update the article.
8. Previous versions remain permanently available.

The MVP intentionally focuses on this workflow before introducing advanced collaboration features.

---

# Ownership-Based Authorization

B HIVE does **not** assign permanent **Author** or **Contributor** roles.

Every authenticated user can:

- publish their own articles
- contribute to articles owned by others

Permissions are determined dynamically using:

- authenticated user
- article ownership
- contribution ownership
- article status
- requested action

---

# User Actions

## Publisher

When a user owns an article, they can:

- Create articles
- Save drafts
- Edit their own articles
- Publish articles
- Archive articles
- Review contribution requests
- Accept contributions
- Reject contributions
- Request revisions
- View article version history

## Contributor

When interacting with another user's published article, they can:

- Browse articles
- Read articles
- Submit contribution requests
- Explain proposed changes
- Revise requested contributions
- Withdraw pending contributions
- Track contribution status

---

# Core MVP Features

- User registration and login
- JWT authentication
- Shared user accounts
- Ownership-based authorization
- Draft and published articles
- Public article browsing
- Contribution request workflow
- Contribution review
- Article version history
- Version conflict detection
- REST API
- MongoDB persistence

---

# Contribution Statuses

- `pending`
- `changes_requested`
- `accepted`
- `rejected`
- `withdrawn`

---

# Article Statuses

- `draft`
- `published`
- `archived`

---

# MVP Workflow

## Publisher Workflow

1. Register or log in.
2. Create an article.
3. Save as draft.
4. Publish.
5. Review incoming contribution requests.
6. Compare current and proposed content.
7. Accept, reject or request changes.
8. Accepted contributions create a new article version.

## Contributor Workflow

1. Register or log in.
2. Browse published articles.
3. Open an article.
4. Select **Suggest an Edit**.
5. Modify a copy of the article.
6. Explain the proposed improvement.
7. Submit the contribution.
8. Track review status.

---

# Technology Stack

## Backend

- Node.js
- Express.js
- MongoDB
- MongoDB Atlas
- Mongoose

## Authentication & Security

- JWT
- bcrypt
- Helmet
- CORS
- Zod Validation
- Express Rate Limit

## Planned Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Markdown Renderer
- Text Difference Viewer

---

# Repository Structure

```text
b-hive/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── docs/
│   └── API_DESIGN.md
└── README.md
```

---

# Backend Modules

- Authentication
- Articles
- Contributions
- Article Versions

---

# MongoDB Collections

- users
- articles
- contributions
- articleversions

---

# Development Roadmap

## Phase 1
- Project setup
- Express configuration
- MongoDB connection
- Security middleware
- Error handling

## Phase 2
- Authentication
- Registration
- Login
- JWT
- Ownership middleware

## Phase 3
- Article CRUD
- Drafts
- Publishing
- Public feed

## Phase 4
- Contribution submission
- Contribution review
- Revision requests
- Merge workflow

## Phase 5
- Version history
- Version conflict detection
- Testing

## Phase 6
- React frontend
- Deployment
- Documentation

---

# Environment Variables

```env
PORT=
NODE_ENV=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
```

Never commit real secrets.

---

# Local Development

```bash
git clone <repository-url>

cd server

npm install

cp .env.example .env

npm run dev
```

---

# Future Scope

- AI-assisted review
- Knowledge graph
- Citation verification
- Plagiarism assistance
- Repository collaboration
- Multiple maintainers
- Research workspaces
- Journalism workflows
- Contributor reputation
- Opportunity discovery
- Advanced version comparison
- Rollback
- Notifications

---

# Security

The backend enforces:

- Password hashing
- JWT authentication
- Ownership verification
- Contribution ownership checks
- Request validation
- Secure headers
- Rate limiting
- Protected environment variables

The frontend is never trusted for authorization.

---

# Documentation

The complete backend architecture, database models and API specification are documented in:

```text
docs/API_DESIGN.md
```

---

# License

To be decided before public release.

---

# Author

**Purva Tripathi**
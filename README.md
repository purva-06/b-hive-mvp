# B HIVE MVP

> A Git-inspired collaborative publishing platform for proposing, reviewing, merging, and attributing improvements to written knowledge.

B HIVE is a full-stack MERN application where users publish Markdown articles and other users propose complete revisions through structured contribution requests. Article owners retain editorial control: they can compare current and proposed content, accept or reject a request, or ask the contributor to revise it.

When a contribution is accepted, B HIVE updates the article and creates an immutable version record so that previous content, contributor attribution, and review history remain available.

## Project Status

B HIVE is under active MVP development.

The `develop` branch currently contains:

- a Node.js, Express, MongoDB, and Mongoose REST API;
- JWT authentication and ownership-based authorization;
- article creation, editing, publication, unpublishing, and archival;
- contribution submission, review, revision, withdrawal, and merging;
- immutable article version history and stale-version conflict protection;
- a React 19 and Vite frontend;
- React Router-based public and protected routes;
- Axios API modules and global authentication state;
- Markdown rendering and article/contribution/version interfaces.

The project is not yet a production release. Automated test coverage, deployment configuration, accessibility review, and final workflow verification remain in progress.

## Problem Statement

Readers frequently identify improvements to published knowledge:

- clearer explanations;
- factual corrections;
- updated information;
- missing context;
- improved structure;
- stronger examples;
- better grammar and readability.

Most publishing platforms provide either comments or direct editing. Comments describe a problem without supplying the complete revision. Direct editing can weaken author control, attribution, and historical traceability.

B HIVE introduces a structured middle layer:

1. A contributor edits a copy of the current article.
2. The contributor explains the proposed improvement.
3. The article owner reviews the original and proposed versions.
4. The owner accepts, rejects, or requests revisions.
5. An accepted contribution becomes a new article version.

## MVP Objective

The MVP validates one central hypothesis:

> Written knowledge can be improved collaboratively through a Git-inspired contribution workflow while preserving editorial ownership, contributor attribution, and complete version history.

The primary end-to-end workflow is:

1. A user registers or logs in.
2. The user creates an article and saves it as a draft.
3. The article owner publishes it.
4. Another authenticated user discovers the article.
5. The second user proposes an improved Markdown version.
6. The article owner reviews the contribution.
7. The owner accepts, rejects, or requests changes.
8. If changes are requested, the contributor revises and resubmits.
9. If accepted, the article content is updated.
10. A new immutable article-version record is created.

## Ownership-Based Authorization

B HIVE does **not** assign permanent `author` and `contributor` account roles.

Every registered user can act as:

- a **publisher** for articles they own;
- a **contributor** for published articles owned by other users.

Permissions are derived dynamically from:

- the authenticated user;
- article ownership;
- contribution ownership;
- article status;
- contribution status;
- the requested action.

Examples:

- only an article owner can edit, publish, unpublish, or archive that article;
- a user cannot contribute to their own article;
- only the original contributor can revise or withdraw a contribution;
- only the target article owner can review a contribution;
- accepted, rejected, and withdrawn contributions are terminal.

The frontend improves usability, but the backend remains the source of truth for authorization.

## Core Features

### Authentication

- User registration and login
- JWT bearer authentication
- Current-user retrieval
- Password hashing
- Protected frontend routes
- Authentication state through React Context
- Automatic token attachment through the Axios client

### Articles

- Create and edit an article
- Save articles as drafts
- Publish and unpublish owned articles
- Archive owned articles
- Browse public published articles
- Render Markdown content
- View the authenticated user’s articles
- Track each article’s current version

### Contributions

- Submit a complete revised article
- Preserve the base article version and original content snapshot
- Explain the proposed change
- View submitted and incoming contributions
- Compare original and proposed content
- Accept, reject, or request revisions
- Revise and resubmit after requested changes
- Withdraw active contributions
- Track contribution status

### Version History

- Store immutable article snapshots
- Number versions sequentially
- Record how each version was created
- Attribute accepted content to its contributor
- Record the publisher who approved it
- Retrieve article version history
- Prevent acceptance of stale contributions

## Resource Statuses

### Article Status

| Status | Meaning |
|---|---|
| `draft` | Private working state; not publicly discoverable |
| `published` | Publicly readable and open for eligible contributions |
| `archived` | Retained for history but removed from the active public workflow |

### Contribution Status

| Status | Meaning |
|---|---|
| `pending` | Awaiting publisher review |
| `changes_requested` | Publisher requested a revised proposal |
| `accepted` | Merged into the article; terminal |
| `rejected` | Declined by the publisher; terminal |
| `withdrawn` | Withdrawn by the contributor; terminal |

## Technology Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- `@tailwindcss/typography`
- `react-markdown`
- ESLint

### Backend

- Node.js
- Express
- MongoDB / MongoDB Atlas
- Mongoose

### Authentication and Security

- JSON Web Tokens
- bcryptjs
- Helmet
- CORS
- Express Rate Limit
- Zod validation
- Morgan request logging
- Environment-based configuration

### Development and Testing

- Nodemon
- Vitest
- Supertest

## System Architecture

```text
Browser
  |
  v
React + React Router
  |
  v
Auth Context + Route-Level Pages
  |
  v
Axios API Modules
  |
  v
Express REST API
  |
  +--> Security, CORS, Rate Limiting, Logging
  +--> Authentication and Validation Middleware
  |
  v
Controllers
  |
  v
Services
  |
  v
Mongoose Models
  |
  v
MongoDB Atlas
```

The frontend never accesses MongoDB directly.

## Repository Structure

```text
b-hive-mvp/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── API_DESIGN.md
└── README.md
```

## Frontend Architecture

### `src/api`

Contains the shared Axios client and feature-specific API modules. Keeping HTTP calls outside page components prevents UI code from becoming tightly coupled to endpoint details.

### `src/context`

Contains global state providers. `AuthContext` restores authentication, exposes the current user, and provides login, registration, and logout actions.

### `src/components`

Reusable UI grouped by article, contribution, layout, and common presentation concerns.

### `src/pages`

Route-level screens that coordinate URL parameters, authentication state, API requests, and reusable components.

### `src/routes`

Application routing and route guards for public, guest-only, and authenticated pages.

## Backend Architecture

The server follows a layered structure:

```text
Route -> Middleware -> Controller -> Service -> Model -> MongoDB
```

- **Routes** define methods, paths, middleware, and controller bindings.
- **Middleware** handles authentication, validation, security, and errors.
- **Controllers** translate HTTP requests into service calls and responses.
- **Services** own workflow rules, status transitions, ownership checks, conflict checks, and transactions.
- **Models** define MongoDB schemas, indexes, references, and validation.

## MongoDB Collections

### `users`

Stores account and profile data such as `name`, `email`, hashed `password`, `bio`, `isActive`, and timestamps.

### `articles`

Stores the latest active article state: `title`, `slug`, `summary`, `content`, `publisher`, `status`, `currentVersion`, publication timestamps, and archive timestamps.

### `contributions`

Stores the target article, contributor, base version, original snapshot, proposed content, explanation, status, review metadata, and resubmission count.

### `articleversions`

Stores immutable article snapshots with version number, content metadata, creator attribution, approval attribution, source contribution, change type, and creation time.

## API Overview

Default local API base URL:

```text
http://localhost:8000/api
```

Main resource groups:

```text
/api/auth
/api/articles
/api/contributions
```

Version-history endpoints are exposed through article-related routes. Protected requests require:

```http
Authorization: Bearer <jwt>
```

See [`API_DESIGN.md`](./API_DESIGN.md) for endpoint contracts, validation rules, response shapes, authorization rules, models, status transitions, and merge behaviour.

## Environment Variables

### Server

Create `server/.env` from `server/.env.example`:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb_connection_string
JWT_SECRET=long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Never commit real credentials.

### Client

Create `client/.env` from `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Do not place secrets in frontend environment variables.

## Local Development

### Prerequisites

- Node.js
- npm
- MongoDB Atlas or another reachable MongoDB instance
- Git

### Clone and select the full-stack branch

```bash
git clone https://github.com/purva-06/b-hive-mvp.git
cd b-hive-mvp
git checkout develop
```

### Run the backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

### Run the frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

The frontend normally runs at `http://localhost:5173`; the API normally runs at `http://localhost:8000`.

## Available Scripts

### Server

```bash
npm run dev
npm start
npm test
```

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Security and Integrity Rules

- Passwords are hashed and excluded from normal responses.
- JWT authentication is stateless.
- Ownership is checked server-side.
- Request bodies are validated before business logic.
- Contribution transitions are restricted.
- Historical versions are immutable.
- Stale-base contributions cannot be silently merged.
- Contribution acceptance should run in a MongoDB transaction.
- CORS, secure headers, rate limits, and protected environment variables are used.
- The frontend is never trusted as the authorization authority.

## Current MVP Limitations

The MVP intentionally excludes:

- AI-assisted review;
- plagiarism and citation verification;
- knowledge graphs;
- article freshness scoring;
- real-time collaboration;
- section-level contributions;
- automatic merge resolution;
- arbitrary branching;
- multiple maintainers;
- organizations;
- notifications;
- contributor reputation;
- recruitment features;
- media uploads;
- payments and social feeds.

## Roadmap

### Near-Term Engineering

- Complete full frontend-to-backend workflow verification
- Add comprehensive API tests
- Add frontend route and component tests
- Improve loading, empty, success, and error states
- Validate responsive and accessible behaviour
- Add CI for linting, tests, and builds
- Add production deployment configuration
- Add OpenAPI documentation or a generated API collection
- Replace the default `client/README.md`

### Product Expansion

- Section-level contribution requests
- Multiple maintainers and review teams
- Review discussion history
- Arbitrary version comparison
- Rollback by creating a new version
- AI-assisted preliminary review
- Citation and source verification
- Knowledge relationships
- Article freshness monitoring
- Private research workspaces
- Journalism review workflows
- Contributor portfolios and opportunity discovery

## License

A final license has not yet been selected. Add a `LICENSE` file before treating the repository as openly reusable.

## Author

**Purva Tripathi**
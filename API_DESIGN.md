# B HIVE REST API Design

**Version:** 1.1  
**Status:** Full-stack MVP development  
**Documented branch:** `develop`  
**Base URL:** `/api`

## 1. Purpose

The B HIVE API supports a Git-inspired publishing workflow for written knowledge.

Users publish Markdown articles. Other users submit complete revised versions as contribution requests. The article owner reviews each proposal and may accept it, reject it, or request changes. Accepting a contribution updates the article and creates an immutable article-version record.

The API preserves:

- editorial ownership;
- contributor attribution;
- submission-time context;
- valid review-state transitions;
- complete article history;
- protection against stale contributions.

## 2. MVP Scope

Included:

- registration and login;
- current-user retrieval;
- article creation and ownership;
- draft, published, and archived article states;
- public article discovery;
- contribution submission and review;
- contribution revision and withdrawal;
- accepted-contribution merging;
- immutable article versions;
- version-conflict detection.

Excluded:

- administrative roles;
- organizations and multiple maintainers;
- real-time collaboration;
- section-level patches;
- automatic merge resolution;
- AI, plagiarism, and citation review;
- notifications, reputation, and recruitment.

## 3. Design Principles

### Stateless JWT authentication

Protected requests include:

```http
Authorization: Bearer <jwt>
```

### JSON-only API

```http
Content-Type: application/json
```

### Ownership-based authorization

The API does not store permanent publisher/contributor roles. Permission is derived from:

```text
authenticated user
+ resource ownership
+ resource status
+ requested action
```

### Server-owned integrity fields

Clients must not control:

```text
publisher
contributor
baseVersion
originalContent
reviewedBy
currentVersion
versionNumber
```

### Immutable history

Article-version documents are append-only. Rollback, when added, must create a new version rather than rewrite an old one.

## 4. Architecture

```text
Client
  -> Express Route
  -> Security / Authentication / Validation Middleware
  -> Controller
  -> Service
  -> Mongoose Model
  -> MongoDB
```

| Layer | Responsibility |
|---|---|
| Route | Method, path, middleware chain, controller binding |
| Middleware | Authentication, validation, security, errors |
| Controller | Request parsing and response formatting |
| Service | Business rules, transitions, transactions, conflicts |
| Model | Schema, indexes, references, field constraints |
| Database | Persistent records |

## 5. Standard Responses

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

### Failure

```json
{
  "success": false,
  "message": "Request validation failed.",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "title",
      "message": "Title must contain at least 5 characters."
    }
  ]
}
```

Recommended stable error codes:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
FORBIDDEN
RESOURCE_NOT_FOUND
DUPLICATE_EMAIL
DUPLICATE_SLUG
INVALID_STATUS_TRANSITION
ACTIVE_CONTRIBUTION_EXISTS
VERSION_CONFLICT
RATE_LIMIT_EXCEEDED
INTERNAL_ERROR
```

## 6. HTTP Status Codes

| Status | Use |
|---:|---|
| `200` | Successful read, update, login, or workflow action |
| `201` | Resource created |
| `400` | Invalid input or state transition |
| `401` | Missing, invalid, or expired authentication |
| `403` | Authenticated but not permitted |
| `404` | Resource not found or intentionally hidden |
| `409` | Duplicate or version/state conflict |
| `429` | Rate limit exceeded |
| `500` | Unexpected server failure |

## 7. Authentication Endpoints

### `POST /api/auth/register`

Public.

```json
{
  "name": "Purva Tripathi",
  "email": "purva@example.com",
  "password": "password123"
}
```

Rules:

- name: 2–80 characters;
- email: valid, normalized, unique;
- password: 8–128 characters.

Returns `201` with the created public user and JWT.

### `POST /api/auth/login`

Public.

```json
{
  "email": "purva@example.com",
  "password": "password123"
}
```

Returns `200` with the public user and JWT. Invalid credentials return `401`.

### `GET /api/auth/me`

Authentication required. Returns the authenticated public user profile.

## 8. Article Endpoints

### Article representation

```json
{
  "id": "ARTICLE_ID",
  "title": "Designing Collaborative Knowledge Systems",
  "slug": "designing-collaborative-knowledge-systems",
  "summary": "An introduction to structured contribution workflows.",
  "content": "# Introduction\n\nMarkdown content.",
  "publisher": {
    "id": "USER_ID",
    "name": "Purva Tripathi",
    "bio": ""
  },
  "status": "published",
  "currentVersion": 3,
  "publishedAt": "2026-07-17T00:00:00.000Z",
  "archivedAt": null,
  "createdAt": "2026-07-17T00:00:00.000Z",
  "updatedAt": "2026-07-17T00:00:00.000Z"
}
```

### `GET /api/articles`

Public list of published articles.

Recommended query parameters:

```text
page
limit
search
publisher
sort
```

### `GET /api/articles/mine`

Authentication required. Lists articles owned by the current user, including private states.

Optional filter:

```text
status=draft|published|archived
```

### `GET /api/articles/:identifier`

Public for published articles. The owner may access their own private article.

Use one consistent identifier contract across server and client. Public URLs should prefer `slug`; internal workflow routes may use MongoDB IDs.

### `POST /api/articles`

Authentication required. Creates a draft.

```json
{
  "title": "Designing Collaborative Knowledge Systems",
  "summary": "An introduction to structured contribution workflows.",
  "content": "# Introduction\n\nMarkdown content."
}
```

Server derives:

```text
publisher = authenticated user
status = draft
currentVersion = 1
slug = generated unique slug
```

### `PATCH /api/articles/:articleId`

Owner only. Updates documented editable fields.

```json
{
  "title": "Updated title",
  "summary": "Updated summary with sufficient detail.",
  "content": "# Updated content"
}
```

A manual content change should increment the article version and create a `manual_edit` version snapshot.

### `PATCH /api/articles/:articleId/publish`

Owner only. Changes the article to `published`.

### `PATCH /api/articles/:articleId/unpublish`

Owner only. Changes a published article to `draft`.

Recommended rule: existing active contributions remain reviewable, but new contributions cannot be submitted while the article is not published.

### `PATCH /api/articles/:articleId/archive`

Owner only. Changes the article to `archived`, sets `archivedAt`, and removes it from the public feed.

Permanent deletion is intentionally excluded from the normal MVP API.

## 9. Contribution Endpoints

### Contribution representation

```json
{
  "id": "CONTRIBUTION_ID",
  "article": "ARTICLE_ID",
  "contributor": {
    "id": "USER_ID",
    "name": "Contributor Name"
  },
  "baseVersion": 3,
  "originalContent": "# Original",
  "proposedContent": "# Proposed",
  "message": "Clarified the explanation and added an example.",
  "status": "pending",
  "reviewComment": "",
  "reviewedBy": null,
  "reviewedAt": null,
  "resubmissionCount": 0,
  "createdAt": "2026-07-17T00:00:00.000Z",
  "updatedAt": "2026-07-17T00:00:00.000Z"
}
```

### `POST /api/articles/:articleId/contributions`

Authentication required.

```json
{
  "proposedContent": "# Revised complete article",
  "message": "Clarified the explanation and updated the example."
}
```

Server derives:

```text
article = route article
contributor = authenticated user
baseVersion = article.currentVersion
originalContent = article.content
status = pending
```

Rules:

- article exists and is published;
- contributor is not the owner;
- proposed content differs from original content;
- message passes validation;
- at most one active contribution per contributor per article.

### `GET /api/contributions/mine`

Authentication required. Lists contributions submitted by the current user.

### `GET /api/articles/:articleId/contributions`

Authentication and article ownership required. Lists incoming contributions for the article.

### `GET /api/contributions/:contributionId`

Authentication required. Visible only to the original contributor and target article owner.

### `PATCH /api/contributions/:contributionId/resubmit`

Original contributor only. Current status must be `changes_requested`.

```json
{
  "proposedContent": "# Revised proposal",
  "message": "Updated according to the review feedback."
}
```

Effects:

```text
status = pending
resubmissionCount += 1
reviewedBy = null
reviewedAt = null
```

The original submission snapshot and base version remain preserved; automatic rebasing is outside the MVP.

### `PATCH /api/contributions/:contributionId/withdraw`

Original contributor only. Allowed from `pending` or `changes_requested`.

### `PATCH /api/contributions/:contributionId/request-changes`

Article owner only. Current status must be `pending`.

```json
{
  "reviewComment": "Please clarify the second section and add supporting context."
}
```

### `PATCH /api/contributions/:contributionId/reject`

Article owner only. Current status must be `pending`.

```json
{
  "reviewComment": "The proposal changes the article's intended scope."
}
```

Rejection is terminal.

### `PATCH /api/contributions/:contributionId/accept`

Article owner only. Current status must be `pending`.

Optional body:

```json
{
  "reviewComment": "Accepted. The revision improves clarity."
}
```

Preconditions:

```text
contribution.article == article.id
authenticated user == article.publisher
contribution.status == pending
contribution.baseVersion == article.currentVersion
```

Atomic effects:

1. Re-read contribution and article inside a transaction.
2. Verify ownership and valid status.
3. Verify the base version is current.
4. Increment `article.currentVersion`.
5. Replace article content with proposed content.
6. Create an immutable `ArticleVersion`.
7. Mark the contribution accepted.
8. Store reviewer metadata.
9. Commit all writes.

A stale contribution returns `409 VERSION_CONFLICT`; it must never be silently merged.

## 10. Contribution State Machine

```text
pending
  |-- accepted
  |-- rejected
  |-- changes_requested
  `-- withdrawn

changes_requested
  |-- pending
  `-- withdrawn
```

Terminal states:

```text
accepted
rejected
withdrawn
```

Invalid transitions return `400` or `409`.

## 11. Version Endpoints

### `GET /api/articles/:articleId/versions`

Returns the article’s immutable version history in descending or ascending version order according to the documented implementation.

Visibility should follow article visibility:

- public for a published article;
- owner-only for private articles;
- contribution-linked metadata must expose only public user fields.

### `GET /api/articles/:articleId/versions/:versionNumber`

Returns one immutable version snapshot.

No normal update or delete endpoint should exist for historical versions.

## 12. Data Models

### User

```text
name: String, required, 2–80
email: String, required, normalized, unique
password: String, required, hashed, excluded by default
bio: String, optional, max 300
isActive: Boolean, default true
createdAt / updatedAt
```

No permanent role field.

### Article

```text
title: String, required, 5–180
slug: String, required, unique, URL-safe
summary: String, required, 20–500
content: String, required, Markdown
publisher: ObjectId -> User
status: draft | published | archived
currentVersion: positive integer
publishedAt: Date | null
archivedAt: Date | null
createdAt / updatedAt
```

Recommended indexes:

```text
slug unique
publisher + createdAt
status + publishedAt
```

### Contribution

```text
article: ObjectId -> Article
contributor: ObjectId -> User
baseVersion: positive integer
originalContent: immutable snapshot
proposedContent: complete proposed Markdown
message: String, 10–1000
status: pending | changes_requested | accepted | rejected | withdrawn
reviewComment: String, max 1000
reviewedBy: ObjectId -> User | null
reviewedAt: Date | null
resubmissionCount: non-negative integer
createdAt / updatedAt
```

Recommended indexes:

```text
article + status + createdAt
contributor + createdAt
article + contributor + status
```

### ArticleVersion

```text
article: ObjectId -> Article
versionNumber: positive sequential integer
title: snapshot
summary: snapshot
content: snapshot
createdBy: ObjectId -> User
approvedBy: ObjectId -> User | null
sourceContribution: ObjectId -> Contribution | null
changeType: initial | manual_edit | accepted_contribution
changeDescription: String, max 500
createdAt
```

Required integrity indexes:

```text
article + versionNumber: unique
sourceContribution: sparse unique
```

## 13. Authorization Matrix

| Action | Public | Authenticated non-owner | Resource owner |
|---|---:|---:|---:|
| List published articles | Yes | Yes | Yes |
| Read published article | Yes | Yes | Yes |
| Read private article | No | No | Yes |
| Create article | No | Yes | Yes |
| Edit/publish/archive article | No | No | Yes |
| Submit contribution | No | Yes, if not owner | No |
| View own contribution | No | Yes | If article owner |
| Revise/withdraw contribution | No | Original contributor | No |
| Review contribution | No | No | Article owner |
| Read public version history | Yes | Yes | Yes |
| Read private version history | No | No | Yes |

## 14. Validation and Security

The server must enforce:

- Zod validation before business logic;
- normalized emails and unique indexes;
- password hashing;
- active-user checks;
- JWT verification;
- ownership and resource-state checks;
- response-field whitelisting;
- Helmet security headers;
- controlled CORS;
- request rate limiting;
- payload-size limits;
- generic authentication errors;
- centralized error handling;
- no password hash exposure;
- no trust in client-provided ownership/version fields.

## 15. Transaction and Concurrency Requirements

Contribution acceptance is a multi-document write and must be atomic.

Recommended transaction:

```text
start session
read contribution
read article
verify reviewer owns article
verify contribution is pending
verify baseVersion == currentVersion
update article and increment currentVersion
insert ArticleVersion
update contribution to accepted
commit
```

A unique `(article, versionNumber)` index and stale-base check protect against concurrent acceptance.

## 16. Pagination

Collection endpoints should return:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "pages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

The project should use one consistent collection key (`items`, `articles`, or `contributions`) and document it per endpoint.

## 17. API Consistency Issues to Resolve

Before freezing the API contract:

1. Standardize whether article detail routes use `_id`, `slug`, or support both.
2. Standardize response IDs as `id` or `_id`; do not mix them.
3. Standardize pagination property names.
4. Standardize whether review comments are retained after resubmission.
5. Confirm version-history route placement in the router.
6. Confirm whether manual article edits always create versions.
7. Define the treatment of active contributions after unpublishing or archiving.
8. Add stable machine-readable error codes.
9. Replace documentation described as “planned” with implemented behaviour.
10. Add integration tests that verify the documented contract.

## 18. Testing Priorities

Highest-priority integration tests:

- duplicate registration;
- invalid login;
- protected route without token;
- owner and non-owner article access;
- self-contribution rejection;
- duplicate active contribution rejection;
- each valid and invalid contribution transition;
- stale-version acceptance conflict;
- transaction rollback on version creation failure;
- version attribution after acceptance;
- private article/version visibility;
- password and private-field exclusion.

## 19. Future-Compatible Extensions

Future capabilities should be added without breaking existing contracts:

- section-level contribution patches;
- review discussion events;
- multiple maintainers;
- organizations and workspaces;
- arbitrary version comparison;
- rollback as a new version;
- AI-assisted checks;
- citation verification;
- knowledge graphs;
- freshness monitoring;
- contributor portfolios and opportunities.


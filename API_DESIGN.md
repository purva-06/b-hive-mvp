# API Design Document

## Project

B HIVE MVP

Version: 1.0

Status: Backend Design Phase

---

# 1. Project Overview

## Purpose

B HIVE MVP is a collaborative publishing platform inspired by Git-based contribution workflows.

Instead of directly editing published articles, contributors submit structured contribution requests. Authors review these requests, compare the proposed changes with the current article, and decide whether to accept, reject, or request revisions.

The primary objective of the MVP is to validate whether a contribution-review workflow can improve collaborative knowledge creation while preserving author control.

---

# MVP Scope

The MVP focuses exclusively on the contribution workflow.

Included:

- User authentication
- Shared user accounts with publisher and contributor capabilities
- Article creation
- Draft and publish workflow
- Public article browsing
- Contribution request submission
- Contribution review
- Article version history
- Author-controlled merging

Excluded:

- AI-assisted review
- Knowledge graph
- Citation verification
- Plagiarism detection
- Recruitment
- Organizations
- Notifications
- Real-time collaboration
- Social features

---

# Target Users

Every registered user may act as both:

## Publisher

A user acts as a publisher when they create and manage their own articles.

They can:

- create articles
- edit their own articles
- publish or archive their own articles
- review contributions submitted to their articles

## Contributor

A user acts as a contributor when they propose changes to another user’s published article.

They can:

- browse published articles
- submit contribution requests
- revise their own contributions
- withdraw pending contributions
- track review outcomes

A user’s permissions depend on their relationship to the resource rather than on a permanently assigned account role.

---

# Success Criteria

The MVP will be considered successful if the following workflow works reliably:

1. User registration

2. Authentication

3. Article publishing

4. Contribution submission

5. Contribution review

6. Contribution acceptance

7. Article update

8. Version history creation

No additional functionality is required for MVP validation.

---

# 2. API Design Principles

The backend will follow REST architectural principles.

Every resource will have a dedicated endpoint.

Resources include:

- Users
- Articles
- Contributions
- Article Versions

---

## Design Principles

### RESTful

Endpoints represent resources rather than actions whenever possible.

Example:

GET /articles

instead of

/getAllArticles

---

### Stateless

Every request must contain the information required to process it.

Authentication is performed using JWT.

The server will not maintain user sessions.

---

### JSON Only

All requests and responses use JSON.

Content-Type:

application/json

---

### Consistent Responses

Every endpoint returns the same response structure.

Success:

{
  "success": true,
  "message": "...",
  "data": {}
}

Failure:

{
  "success": false,
  "message": "...",
  "errors": []
}

---

### Authorization

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

Every protected route validates both.

---

### Ownership-Based Security

The MVP does not assign a permanent author or contributor role to an account.

Permissions are determined by authentication, resource ownership, resource status, and the requested action.

Examples:

A user may edit only articles they own.

A user may revise or withdraw only contribution requests they submitted.

---

### Validation

Every incoming request is validated before reaching business logic.

Validation failures return HTTP 400.

---

### Version Safety

Accepted contributions always create a new article version.

Previous versions remain unchanged.

No accepted contribution permanently overwrites history.

---

### Idempotency

GET requests never modify data.

DELETE operations should be safely repeatable.

PATCH endpoints modify only requested fields.

---

### Predictable Status Codes

Every endpoint returns appropriate HTTP status codes.

No endpoint should return HTTP 200 for an error condition.

---

### Separation of Concerns

Routes

↓

Middleware

↓

Controllers

↓

Services

↓

Models

↓

MongoDB

Each layer has one responsibility.

---

### Security First

Passwords are hashed.

JWT secrets are stored in environment variables.

Authorization is enforced by the backend.

The frontend is never trusted.

---

### Scalability

The architecture should allow future addition of:

- AI review
- Knowledge graphs
- Organizations
- Research repositories
- Journalism workflows

without changing existing APIs.

=================================================
PART 2 — SYSTEM ARCHITECTURE
=================================================

# 3. Backend Architecture

B HIVE MVP follows a layered architecture that separates responsibilities into independent modules. Each layer performs a single responsibility and communicates only with adjacent layers.

This approach improves maintainability, testability and scalability.

The backend follows the flow:

```
Client
   │
   ▼
Express Routes
   │
   ▼
Middleware
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Models (Mongoose)
   │
   ▼
MongoDB Atlas
```

The frontend never communicates directly with the database.

Every request must pass through the backend.

---

# 4. Backend Layers

## 4.1 Routes

Routes define:

- HTTP method
- endpoint path
- middleware
- controller

Example:

```
POST /api/articles
```

Responsibilities:

- Map incoming requests
- Apply middleware
- Forward requests to controllers

Routes must never contain business logic.

---

## 4.2 Middleware

Middleware executes before the request reaches the controller.

Responsibilities:

- Parse JSON requests
- Configure CORS
- Security headers
- Logging
- Authentication
- Ownership-based and action-based authorization
- Request validation
- Rate limiting
- Error handling

Middleware should be reusable across multiple routes.

---

## 4.3 Controllers

Controllers receive validated HTTP requests.

Responsibilities:

- Read request parameters
- Read request body
- Read authenticated user
- Call services
- Return HTTP responses

Controllers should remain thin.

Business logic belongs in services.

---

## 4.4 Services

Services contain the core application logic.

Examples:

- Register user
- Authenticate user
- Create article
- Publish article
- Submit contribution
- Accept contribution
- Reject contribution
- Create article version
- Detect version conflicts

Services communicate with the database through models.

---

## 4.5 Models

Models define MongoDB document structure using Mongoose.

Planned models:

- User
- Article
- Contribution
- ArticleVersion

Responsibilities:

- Schema definition
- Validation
- Relationships
- Indexes
- Default values

Models should not contain authorization logic.

---

## 4.6 Database

MongoDB Atlas stores all persistent data.

Collections:

- users
- articles
- contributions
- articleversions

The database is accessed only through Mongoose models.

The frontend never communicates directly with MongoDB.

---

# 5. Backend Folder Structure

```
server/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── scripts/
├── tests/
├── .env
├── .env.example
├── package.json
└── package-lock.json
```

Folder responsibilities:

### config/

Contains:

- MongoDB connection
- Environment variables
- Application configuration

---

### controllers/

Contains all HTTP controllers.

Example:

- authController
- articleController
- contributionController

---

### middleware/

Contains reusable middleware.

Examples:

- Authentication
- Ownership-based and action-based authorization
- Validation
- Error handling

---

### models/

Contains Mongoose schemas.

Examples:

- User
- Article
- Contribution
- ArticleVersion

---

### routes/

Contains Express routers.

Each router is responsible for one resource.

---

### services/

Contains business logic.

Controllers should delegate all complex operations to services.

---

### validators/

Contains request validation schemas.

Example:

- Register validation
- Login validation
- Create article validation
- Contribution validation

---

### utils/

Contains reusable helper functions.

Examples:

- JWT generation
- Slug generation
- Async handler
- Custom error classes

---

# 6. Server Startup Lifecycle

When the backend starts, the following sequence occurs:

```
Start server
        │
        ▼
Load environment variables
        │
        ▼
Validate configuration
        │
        ▼
Connect MongoDB Atlas
        │
        ▼
Configure Express
        │
        ▼
Register middleware
        │
        ▼
Register routes
        │
        ▼
Start listening on configured port
```

The server should never start accepting requests unless the database connection succeeds.

---

# 7. Request Lifecycle

Every incoming request follows the same lifecycle.

```
Client Request
        │
        ▼
Security Middleware
        │
        ▼
CORS
        │
        ▼
JSON Parser
        │
        ▼
Request Logger
        │
        ▼
Route Matching
        │
        ▼
Authentication Middleware
        │
        ▼
Authorization Middleware
        │
        ▼
Request Validation
        │
        ▼
Controller
        │
        ▼
Service
        │
        ▼
Database
        │
        ▼
JSON Response
```

This standardized lifecycle ensures that:

- every protected request is authenticated
- every request is validated
- controllers remain lightweight
- services contain business logic
- responses remain consistent

---

# 8. Core Backend Modules

The backend is divided into four primary modules.

## Authentication Module

Responsible for:

- Registration
- Login
- JWT generation
- Password hashing
- Authentication middleware

---

## Article Module

Responsible for:

- Create article
- Edit article
- Publish article
- Archive article
- Retrieve articles

---

## Contribution Module

Responsible for:

- Submit contribution
- Request changes
- Reject contribution
- Accept contribution
- Contribution history

---

## Version Module

Responsible for:

- Store article versions
- Retrieve version history
- Version conflict detection
- Accepted contribution tracking

---

# 9. Design Principles for Scalability

The MVP is intentionally designed so that future features can be added without changing the existing architecture.

Future modules may include:

- AI Review
- Knowledge Graph
- Organizations
- Research Repositories
- Journalism Workflows
- Notifications
- Contributor Reputation
- Recruitment
- Citation Verification
- Plagiarism Detection

These features should integrate as independent modules while preserving the existing API contracts.

=================================================
PART 3 — DATABASE DESIGN AND DATA MODELS
=================================================

# 10. Database Design Overview

B HIVE MVP uses MongoDB as its primary database and Mongoose as its object modelling library.

The MVP contains four primary data models:

- User
- Article
- Contribution
- ArticleVersion

These models represent the complete contribution workflow:

```text
User
  │
  ├── creates ───────────────► Article
  │
  ├── submits ───────────────► Contribution
  │
  └── creates or reviews ────► ArticleVersion

Article
  │
  ├── belongs to one publisher
  ├── receives many contributions
  └── contains many version records

Contribution
  │
  ├── belongs to one article
  ├── belongs to one contributor
  └── may create a new article version when accepted
```

The terms **publisher** and **contributor** describe what a user is doing in relation to a particular resource. They are not permanent account roles.

A registered user may:

- publish and manage their own articles
- contribute to published articles owned by other users
- review contributions submitted to articles they own

MongoDB references will be used between related documents rather than embedding all related data inside one document.

This keeps:

- user data centralized
- article documents manageable
- contribution history independent
- version history immutable
- database queries predictable

---

# 11. General Model Conventions

All models should follow these conventions.

## 11.1 MongoDB Object IDs

Every document receives an automatically generated MongoDB `_id`.

Related models will store references using:

```text
ObjectId
```

Examples:

```text
Article.publisher → User._id
Contribution.article → Article._id
Contribution.contributor → User._id
Contribution.reviewedBy → User._id
ArticleVersion.article → Article._id
ArticleVersion.createdBy → User._id
```

---

## 11.2 Timestamps

Every primary model should enable Mongoose timestamps unless the model is intentionally immutable.

This normally creates:

```text
createdAt
updatedAt
```

These fields support:

- sorting
- audit history
- dashboards
- contribution timelines
- article history
- debugging

For immutable ArticleVersion records, `createdAt` is essential while `updatedAt` is not functionally necessary.

---

## 11.3 Enum Values

Fields with a limited set of valid values should use enums.

Examples:

```text
Article status:
- draft
- published
- archived

Contribution status:
- pending
- changes_requested
- accepted
- rejected
- withdrawn

Article version change type:
- initial
- manual_edit
- accepted_contribution
```

The User model does not contain a permanent `role` field.

---

## 11.4 Soft State Changes

Articles and contributions should generally change status instead of being permanently deleted immediately.

Examples:

```text
Article:
published → archived

Contribution:
pending → withdrawn
```

This preserves useful history and attribution.

---

## 11.5 Limited Historical Duplication

Limited duplication is acceptable where it protects historical accuracy.

For example, a contribution stores:

```text
originalContent
proposedContent
```

even though the related Article also stores current content.

This is intentional because the article may change after the contribution is submitted.

---

## 11.6 Authorization Is Not a Schema Concern

Mongoose validation protects document shape and field values, but it does not determine whether a user is allowed to perform an action.

Authorization must be enforced in middleware and services using:

```text
authenticated user
+
resource ownership
+
resource status
+
requested action
```

---

# 12. User Model

## 12.1 Purpose

The User model represents every registered person using B HIVE MVP.

The platform does not permanently classify users as authors or contributors.

A user acts as a **publisher** when they create or manage their own article.

A user acts as a **contributor** when they propose a change to another user's published article.

This avoids unnecessary account restrictions and reflects the actual behaviour of the platform.

---

## 12.2 User Fields

| Field | Type | Required | Default | Purpose |
|---|---|---:|---|---|
| `_id` | ObjectId | Automatic | Generated | Unique user identifier |
| `name` | String | Yes | None | Public display name |
| `email` | String | Yes | None | Login identifier |
| `password` | String | Yes | None | Hashed password |
| `bio` | String | No | Empty string | Short profile description |
| `isActive` | Boolean | Yes | `true` | Allows an account to be disabled without deleting history |
| `createdAt` | Date | Automatic | Generated | Account creation time |
| `updatedAt` | Date | Automatic | Generated | Last account update |

---

## 12.3 User Field Rules

### `name`

Validation rules:

```text
Required
Trim whitespace
Minimum length: 2 characters
Maximum length: 80 characters
```

The name may appear on:

- articles
- contributions
- article versions
- dashboards

---

### `email`

Validation rules:

```text
Required
Unique
Converted to lowercase
Trim whitespace
Valid email format
```

The email should be normalized before lookup.

For example:

```text
Purva@example.com
purva@example.com
```

should be treated as the same address.

A unique index should prevent duplicate accounts.

---

### `password`

Validation rules before hashing:

```text
Required
Minimum length: 8 characters
Maximum length: 128 characters
```

The database must store only the hashed password.

The password field should be excluded from normal query results and selected explicitly only when verifying login credentials.

---

### `bio`

Validation rules:

```text
Optional
Trim whitespace
Maximum length: 300 characters
```

The bio supports a minimal public profile but is not required for the contribution workflow.

---

### `isActive`

Allowed values:

```text
true
false
```

Inactive users should not be able to perform protected actions.

Disabling an account preserves:

- published articles
- accepted contributions
- attribution history
- article versions

---

## 12.4 User Indexes

Recommended indexes:

```text
email: unique index
createdAt: standard index, optional
```

The email index is required for fast login lookup and uniqueness enforcement.

---

## 12.5 User Relationships

```text
User
  │
  ├── has many Articles as publisher
  ├── has many Contributions as contributor
  ├── may review many Contributions as article owner
  └── may create many ArticleVersions
```

These relationships are stored on the related models rather than as growing arrays inside the User document.

---

# 13. Article Model

## 13.1 Purpose

The Article model represents written content created by a registered user.

An article may be:

- draft
- published
- archived

Only published articles are publicly visible and open to contributions.

The user referenced by the `publisher` field owns the article.

---

## 13.2 Article Fields

| Field | Type | Required | Default | Purpose |
|---|---|---:|---|---|
| `_id` | ObjectId | Automatic | Generated | Unique article identifier |
| `title` | String | Yes | None | Article title |
| `slug` | String | Yes | Generated | Human-readable URL identifier |
| `summary` | String | Yes | None | Short article description |
| `content` | String | Yes | None | Current Markdown content |
| `publisher` | ObjectId reference | Yes | None | User who owns the article |
| `status` | String enum | Yes | `draft` | Publication state |
| `currentVersion` | Number | Yes | `1` | Latest article version number |
| `publishedAt` | Date | No | `null` | First publication timestamp |
| `archivedAt` | Date | No | `null` | Archive timestamp |
| `createdAt` | Date | Automatic | Generated | Creation time |
| `updatedAt` | Date | Automatic | Generated | Last update time |

---

## 13.3 Article Field Rules

### `title`

Validation rules:

```text
Required
Trim whitespace
Minimum length: 5 characters
Maximum length: 180 characters
```

---

### `slug`

Example:

```text
how-collaborative-research-can-improve
```

Validation rules:

```text
Required
Unique
Lowercase
URL-safe
Indexed
```

The slug should be generated from the article title.

If a generated slug already exists, a unique suffix should be added.

Examples:

```text
research-collaboration
research-collaboration-2
```

The slug should not automatically change whenever the title changes because that would break existing links.

---

### `summary`

Validation rules:

```text
Required
Trim whitespace
Minimum length: 20 characters
Maximum length: 500 characters
```

The summary may appear in:

- public article cards
- dashboards
- previews

---

### `content`

Validation rules:

```text
Required
Stored as Markdown text
Minimum meaningful length: 50 characters
```

The content field stores the latest active article content.

Historical snapshots are stored in ArticleVersion documents.

---

### `publisher`

Type:

```text
ObjectId reference to User
```

Rules:

- Required
- Assigned from the authenticated user
- Must reference an active registered user
- Immutable after article creation
- Must never be accepted directly from an untrusted request body

Any active authenticated user may create an article.

---

### `status`

Allowed values:

```text
draft
published
archived
```

Default:

```text
draft
```

Recommended MVP transitions:

```text
draft → published
published → draft
published → archived
archived → published
```

The service layer must control these transitions.

---

### `currentVersion`

Type:

```text
Number
```

Default:

```text
1
```

Rules:

- Must be a positive integer
- Must never decrease
- Increases when an article change creates a new version
- Used for contribution conflict detection

---

### `publishedAt`

Default:

```text
null
```

Recommended MVP behaviour:

- set when the article is first published
- preserve the original publication timestamp during ordinary edits
- do not reset automatically when unpublished and republished

---

### `archivedAt`

Default:

```text
null
```

Set when the article becomes archived.

It may be cleared if the article is later republished.

---

## 13.4 Article Indexes

Recommended indexes:

```text
slug: unique index
publisher + createdAt: compound index
status + publishedAt: compound index
```

Purposes:

- `slug` supports public article lookup
- `publisher + createdAt` supports the user's article dashboard
- `status + publishedAt` supports the public article feed

---

## 13.5 Article Relationships

```text
Article
  │
  ├── belongs to one User as publisher
  ├── receives many Contributions
  └── contains many ArticleVersions
```

The Article document should not contain growing arrays of contribution IDs or version IDs.

---

# 14. Contribution Model

## 14.1 Purpose

The Contribution model represents a proposed article revision submitted by a registered user.

It stores both:

- the article content at submission time
- the contributor's proposed content

This preserves an accurate comparison even if the article changes later.

A contribution can only target another user's published article.

---

## 14.2 Contribution Fields

| Field | Type | Required | Default | Purpose |
|---|---|---:|---|---|
| `_id` | ObjectId | Automatic | Generated | Unique contribution identifier |
| `article` | ObjectId reference | Yes | None | Target article |
| `contributor` | ObjectId reference | Yes | None | User proposing the change |
| `baseVersion` | Number | Yes | None | Article version used as the editing base |
| `originalContent` | String | Yes | None | Article content at submission time |
| `proposedContent` | String | Yes | None | Suggested revised article content |
| `message` | String | Yes | None | Contributor's explanation |
| `status` | String enum | Yes | `pending` | Current review state |
| `reviewComment` | String | No | Empty string | Publisher feedback |
| `reviewedBy` | ObjectId reference | No | `null` | User who reviewed the contribution |
| `reviewedAt` | Date | No | `null` | Most recent review timestamp |
| `resubmissionCount` | Number | Yes | `0` | Number of revision cycles |
| `createdAt` | Date | Automatic | Generated | Initial submission time |
| `updatedAt` | Date | Automatic | Generated | Last update time |

---

## 14.3 Contribution Field Rules

### `article`

Type:

```text
ObjectId reference to Article
```

Rules:

- Required
- Must reference an existing article
- Article must be published when the contribution is created
- Article must be owned by another user

---

### `contributor`

Type:

```text
ObjectId reference to User
```

Rules:

- Required
- Assigned from the authenticated user
- Must reference an active user
- Must not equal the article publisher
- Must never be trusted directly from the request body

---

### `baseVersion`

Purpose:

Records the article version from which the proposal was created.

Example:

```text
baseVersion: 3
```

Before acceptance, the following must be true:

```text
contribution.baseVersion === article.currentVersion
```

Otherwise, the API should return a version conflict.

---

### `originalContent`

Purpose:

Stores an immutable snapshot of the article content at submission time.

Rules:

- Fetched from the Article document by the backend
- Never trusted from the frontend
- Not changed during normal review or resubmission
- Preserved for accurate comparison

Automatic rebasing is outside the MVP.

---

### `proposedContent`

Validation rules:

```text
Required
Must contain meaningful content
Must not be identical to originalContent
```

For the MVP, the user proposes a complete replacement Markdown document.

Section-level contributions may be introduced later.

---

### `message`

Purpose:

Explains:

- what changed
- why it changed
- the expected improvement
- relevant supporting context

Validation rules:

```text
Required
Trim whitespace
Minimum length: 10 characters
Maximum length: 1000 characters
```

---

### `status`

Allowed values:

```text
pending
changes_requested
accepted
rejected
withdrawn
```

Default:

```text
pending
```

---

## 14.4 Contribution Status Meanings

### `pending`

The contribution is waiting for review.

Allowed next states:

```text
accepted
rejected
changes_requested
withdrawn
```

---

### `changes_requested`

The article publisher has requested revision.

Allowed next states:

```text
pending
withdrawn
```

Only the original contributor may revise and resubmit it.

---

### `accepted`

The proposed content has been merged into the article.

This is a terminal state.

---

### `rejected`

The article publisher has declined the proposal.

This is a terminal state for the MVP.

---

### `withdrawn`

The contributor withdrew the request before acceptance.

This is a terminal state.

---

## 14.5 Contribution Status Transitions

```text
pending
  ├──► accepted
  ├──► rejected
  ├──► changes_requested
  └──► withdrawn

changes_requested
  ├──► pending
  └──► withdrawn
```

Invalid examples:

```text
accepted → pending
rejected → accepted
withdrawn → changes_requested
```

The service layer must enforce valid transitions.

---

### `reviewComment`

Validation rules:

```text
Maximum length: 1000 characters
```

Recommended requirements:

- required when requesting changes
- required when rejecting
- optional when accepting

---

### `reviewedBy`

Type:

```text
ObjectId reference to User
```

Set when a review action occurs.

The reviewing user must own the related article.

---

### `reviewedAt`

Set whenever a review action occurs.

Recommended behaviour on contributor resubmission:

```text
reviewedAt = null
reviewedBy = null
status = pending
```

The previous review comment may either be retained or replaced depending on the final API contract.

For the MVP, retain the most recent review comment until the next review action.

---

### `resubmissionCount`

Default:

```text
0
```

Increment when a contributor resubmits after changes were requested.

---

## 14.6 Contribution Indexes

Recommended indexes:

```text
article + status + createdAt
contributor + createdAt
article + contributor + status
```

Purposes:

- review queue for an article
- contributor dashboard
- detection of existing open contributions

Recommended MVP rule:

A user may have only one active contribution per article.

Active statuses:

```text
pending
changes_requested
```

This may initially be enforced in the service layer.

---

## 14.7 Contribution Relationships

```text
Contribution
  │
  ├── belongs to one Article
  ├── belongs to one User as contributor
  ├── may be reviewed by the article publisher
  └── may become the source of one ArticleVersion
```

---

# 15. ArticleVersion Model

## 15.1 Purpose

The ArticleVersion model stores immutable snapshots of an article.

It provides:

- version history
- auditability
- contribution attribution
- safe content recovery
- historical comparison

ArticleVersion records should not be modified after creation.

---

## 15.2 ArticleVersion Fields

| Field | Type | Required | Default | Purpose |
|---|---|---:|---|---|
| `_id` | ObjectId | Automatic | Generated | Unique version identifier |
| `article` | ObjectId reference | Yes | None | Parent article |
| `versionNumber` | Number | Yes | None | Sequential article version |
| `title` | String | Yes | None | Title at this version |
| `summary` | String | Yes | None | Summary at this version |
| `content` | String | Yes | None | Content snapshot |
| `createdBy` | ObjectId reference | Yes | None | User whose action or content produced the version |
| `approvedBy` | ObjectId reference | No | `null` | Publisher who approved an accepted contribution |
| `sourceContribution` | ObjectId reference | No | `null` | Accepted contribution source |
| `changeType` | String enum | Yes | None | Reason for version creation |
| `changeDescription` | String | No | Empty string | Human-readable explanation |
| `createdAt` | Date | Automatic | Generated | Version creation time |

An ArticleVersion is immutable and does not require an editable `updatedAt` lifecycle.

---

## 15.3 ArticleVersion Field Rules

### `article`

Type:

```text
ObjectId reference to Article
```

Required and indexed.

---

### `versionNumber`

Rules:

```text
Required
Positive integer
Sequential within each article
Unique together with article ID
```

Required unique compound index:

```text
article + versionNumber
```

---

### `title`, `summary`, and `content`

These fields store a complete snapshot.

Complete snapshots are appropriate for the MVP because:

- articles are expected to remain reasonably small
- retrieval is simple
- restoration is straightforward
- comparison is easy
- implementation is less error-prone

Diff-only storage may be considered later.

---

### `createdBy`

Represents the user whose action or accepted contribution produced the version.

Rules:

- For an initial or manual edit, use the article publisher.
- For an accepted contribution, use the contributor.

---

### `approvedBy`

Default:

```text
null
```

Rules:

- For an accepted contribution, use the article publisher who approved it.
- For an initial or manual edit, this may remain null because the publisher is already represented by `createdBy`.

This field clearly distinguishes contribution authorship from merge approval.

---

### `sourceContribution`

Default:

```text
null
```

Set only when a version resulted from an accepted contribution.

This links:

```text
accepted contribution
        ↓
article version
```

---

### `changeType`

Allowed values:

```text
initial
manual_edit
accepted_contribution
```

Meaning:

- `initial`: first stored article version
- `manual_edit`: article publisher directly changed the article
- `accepted_contribution`: article content came from an accepted contribution

---

### `changeDescription`

Validation rules:

```text
Optional
Trim whitespace
Maximum length: 500 characters
```

Examples:

```text
Initial article version
Updated introduction and conclusion
Accepted contribution: clarified the methodology section
```

---

## 15.4 ArticleVersion Indexes

Recommended indexes:

```text
article + versionNumber: unique compound index
article + createdAt: compound index
sourceContribution: sparse unique index
```

A sparse unique index on `sourceContribution` ensures that one accepted contribution does not create multiple article versions.

---

## 15.5 ArticleVersion Immutability

The normal API should support:

```text
Read version history
Read one version
```

It should not support:

```text
Update a historical version
Delete an individual historical version
```

A future rollback should create a new version from an older snapshot rather than rewriting history.

---

# 16. Model Relationship Summary

```text
User
  │
  ├── 1 to many ──► Article as publisher
  ├── 1 to many ──► Contribution as contributor
  ├── 1 to many ──► reviewed Contributions
  └── 1 to many ──► ArticleVersion

Article
  │
  ├── many to 1 ──► User as publisher
  ├── 1 to many ──► Contribution
  └── 1 to many ──► ArticleVersion

Contribution
  │
  ├── many to 1 ──► Article
  ├── many to 1 ──► User as contributor
  └── optional 1 to 1 ──► ArticleVersion as source

ArticleVersion
  │
  ├── many to 1 ──► Article
  ├── many to 1 ──► User as creator
  ├── optionally approved by one User
  └── optionally references one Contribution
```

---

# 17. Model Population Strategy

Mongoose population may be used when a response needs related public information.

## Public article response

Populate only:

```text
publisher.name
publisher.bio
```

Do not expose:

```text
publisher.email
publisher.password
internal account fields
```

---

## Contribution review response

Populate only required fields such as:

```text
contributor.name
article.title
article.publisher
reviewedBy.name
```

Avoid populating complete related documents unnecessarily.

---

# 18. Data Integrity Rules

The service layer must enforce the following rules.

## User rules

- Email must be unique.
- Password must always be hashed.
- Inactive users cannot perform protected actions.
- No permanent author or contributor role is stored.

## Article rules

- Any active authenticated user may create an article.
- Only the publisher may edit, publish, unpublish, or archive the article.
- Only published articles are publicly visible.
- Slugs must be unique.
- Version numbers must never decrease.

## Contribution rules

- Contributions may target only published articles.
- A user cannot contribute to their own article.
- Proposed content must differ from original content.
- The backend stores the original article snapshot.
- Only the original contributor may revise or withdraw the contribution.
- Only the article publisher may review the contribution.
- Only valid status transitions are permitted.
- Accepted contributions cannot be edited.
- Acceptance fails if the base article version is outdated.

## Version rules

- A version number must be unique within an article.
- Version records are immutable.
- Accepted contributions create a version record.
- An accepted contribution may be linked to only one version.
- Contribution acceptance must update related records atomically.

---

# 19. Deletion Strategy

## User deletion

The MVP should not permanently delete users through the normal API.

Use:

```text
isActive = false
```

This preserves article and contribution history.

---

## Article deletion

Recommended MVP approach:

```text
Archive instead of permanently delete
```

Permanent deletion could orphan:

- contributions
- article versions
- attribution history

---

## Contribution deletion

A contributor should withdraw an active contribution instead of deleting it.

---

## ArticleVersion deletion

Article versions should not be individually deleted.

They are permanent historical records.

---

# 20. MongoDB Transaction Requirements

A MongoDB transaction is required when accepting a contribution because several related writes must succeed together:

1. Verify the contribution.
2. Verify the article.
3. Verify article ownership.
4. Verify the contribution base version.
5. Preserve the current article snapshot where required.
6. Update article content.
7. Increase the article version number.
8. Create the new ArticleVersion.
9. Mark the contribution as accepted.
10. Store reviewer metadata.

If any step fails, all changes must be rolled back.

Simple single-document operations such as registration or initial article creation normally do not require a transaction.

---

# 21. Data Model Decisions Deferred

The following are intentionally deferred beyond the MVP:

- Administrative roles
- Organizations and teams
- Multiple article publishers
- Multiple maintainers
- Section-level article structure
- Inline comments
- Contribution discussions
- Full review-event history
- Reactions and social activity
- Notifications
- Attachments and media files
- Structured citation documents
- Knowledge graph relationships
- AI review results
- Public reputation scores
- Contribution certificates
- Automatic merging
- Real-time collaborative editing

These features should not be added to the initial schemas unless they become necessary through implementation or validation.

=================================================
PART 4 — AUTHENTICATION API
=================================================

# 22. Authentication Overview

Authentication is responsible for verifying user identity and protecting private API endpoints.

The MVP uses:

- JSON Web Tokens (JWT)
- bcrypt password hashing
- Bearer Token authentication
- Stateless authentication

Only authenticated users can:

- create articles
- edit their own articles
- publish articles
- submit contributions
- review contributions
- access private dashboards

Public users can browse published articles without authentication.

---

# 23. Authentication Flow

The authentication lifecycle is shown below.

```text
User
   │
   ▼
Register Account
   │
   ▼
Password is hashed
   │
   ▼
User stored in MongoDB
   │
   ▼
Login
   │
   ▼
Email lookup
   │
   ▼
Password verification
   │
   ▼
JWT generated
   │
   ▼
Client stores token
   │
   ▼
Protected Request
   │
   ▼
JWT Verification Middleware
   │
   ▼
Authenticated User
```

---

# 24. Authentication Endpoints

The MVP exposes three authentication endpoints.

| Method | Endpoint | Purpose |
|---------|----------|---------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Return the authenticated user's profile |

---

# 25. Register User

## Endpoint

```http
POST /api/auth/register
```

---

## Purpose

Creates a new user account.

Every newly registered user can immediately:

- create articles
- contribute to other users' articles

No administrator approval is required.

---

## Authentication Required

No

---

## Request Body

```json
{
  "name": "Purva Tripathi",
  "email": "purva@example.com",
  "password": "password123"
}
```

---

## Validation Rules

### name

- Required
- String
- Minimum 2 characters
- Maximum 80 characters

---

### email

- Required
- Valid email
- Converted to lowercase
- Must be unique

---

### password

- Required
- Minimum 8 characters
- Maximum 128 characters

---

## Successful Response

HTTP Status

```text
201 Created
```

Example

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "...",
      "name": "Purva Tripathi",
      "email": "purva@example.com"
    },
    "token": "<jwt>"
  }
}
```

---

## Possible Errors

| Status | Reason |
|---------|--------|
|400|Validation failed|
|409|Email already exists|
|500|Internal server error|

---

# 26. Login

## Endpoint

```http
POST /api/auth/login
```

---

## Purpose

Authenticates an existing user.

---

## Authentication Required

No

---

## Request Body

```json
{
  "email":"purva@example.com",
  "password":"password123"
}
```

---

## Validation Rules

Email

- Required
- Valid email

Password

- Required

---

## Successful Response

HTTP Status

```text
200 OK
```

Example

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id":"...",
      "name":"Purva Tripathi",
      "email":"purva@example.com"
    },
    "token":"<jwt>"
  }
}
```

---

## Possible Errors

| Status | Reason |
|---------|--------|
|400|Validation failed|
|401|Invalid email or password|
|500|Internal server error|

---

# 27. Current User

## Endpoint

```http
GET /api/auth/me
```

---

## Purpose

Returns information about the authenticated user.

---

## Authentication Required

Yes

Bearer Token

---

## Request Headers

```http
Authorization: Bearer <JWT>
```

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "id":"...",
    "name":"Purva Tripathi",
    "email":"purva@example.com",
    "bio":"...",
    "createdAt":"..."
  }
}
```

---

## Possible Errors

| Status | Reason |
|---------|--------|
|401|Missing token|
|401|Invalid token|
|404|User not found|

---

# 28. JWT Strategy

The backend uses JSON Web Tokens for stateless authentication.

Each JWT contains:

```text
User ID
Issued At
Expiration Time
```

Sensitive information such as passwords must never be stored inside the token.

---

# 29. Password Security

Passwords are never stored in plain text.

During registration:

```text
Password
      │
      ▼
bcrypt Hash
      │
      ▼
MongoDB
```

During login:

```text
Submitted Password
      │
      ▼
bcrypt.compare()
      │
      ▼
Match
```

The original password can never be recovered from the stored hash.

---

# 30. Authentication Middleware

Every protected endpoint passes through authentication middleware.

Responsibilities:

- Read Authorization header
- Verify JWT
- Find the user
- Verify account is active
- Attach the authenticated user to the request
- Continue to the next middleware

If authentication fails:

```text
401 Unauthorized
```

is returned immediately.

---

# 31. Protected Endpoints

The following endpoints require authentication:

- Create article
- Update article
- Publish article
- Archive article
- Submit contribution
- Update contribution
- Withdraw contribution
- Review contribution
- View personal dashboard
- View personal contributions

Public endpoints remain accessible without authentication.

---

# 32. Security Notes

The authentication system should follow these principles:

- Passwords are always hashed using bcrypt.
- JWT secrets are stored in environment variables.
- Authentication is stateless.
- Passwords are never returned in API responses.
- Generic login errors prevent account enumeration.
- Expired or invalid tokens always return `401 Unauthorized`.
- Only active users can access protected resources.

=================================================
PART 5 — ARTICLES API
=================================================

# 33. Articles Overview

The Article module is responsible for creating, managing, publishing, retrieving and archiving knowledge articles.

In the MVP, an article represents a collaborative knowledge asset.

Examples include:

- Technical documentation
- Research notes
- Tutorials
- Knowledge articles
- Educational content

Only the owner of an article can modify or publish it.

Other authenticated users may submit contribution requests only after the article has been published.

---

# 34. Article Lifecycle

An article progresses through the following lifecycle.

```text
Create
   │
   ▼
Draft
   │
   ▼
Publish
   │
   ▼
Receive Contributions
   │
   ▼
Accept Contributions
   │
   ▼
New Versions
   │
   ▼
Archive (optional)
```

Only published articles are publicly visible.

Draft articles remain private to their owner.

Archived articles are no longer publicly discoverable but their history is preserved.

---

# 35. Article Endpoints

| Method | Endpoint | Purpose | Authentication |
|---------|----------|---------|----------------|
| POST | `/api/articles` | Create article | Required |
| GET | `/api/articles` | List published articles | Public |
| GET | `/api/articles/:slug` | View published article | Public |
| PATCH | `/api/articles/:id` | Update article | Required |
| PATCH | `/api/articles/:id/publish` | Publish article | Required |
| PATCH | `/api/articles/:id/archive` | Archive article | Required |
| GET | `/api/articles/me` | View my articles | Required |

---

# 36. Create Article

## Endpoint

```http
POST /api/articles
```

---

## Purpose

Creates a new article owned by the authenticated user.

The article is initially stored as a draft.

---

## Authentication Required

Yes

Bearer Token

---

## Request Body

```json
{
  "title": "Understanding REST APIs",
  "summary": "A beginner friendly introduction to REST APIs.",
  "content": "# Introduction\n..."
}
```

---

## Validation Rules

### title

- Required
- String
- 5–180 characters

### summary

- Required
- String
- 20–500 characters

### content

- Required
- Markdown text
- Minimum 50 characters

The backend generates:

- slug
- publisher
- currentVersion
- timestamps

The frontend must never provide these values.

---

## Successful Response

HTTP Status

```text
201 Created
```

Example

```json
{
  "success": true,
  "message": "Article created successfully.",
  "data": {
    "article": {
      "id": "...",
      "title": "...",
      "slug": "...",
      "status": "draft",
      "currentVersion": 1
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---------|--------|
|400|Validation failed|
|401|Unauthenticated|
|500|Internal server error|

---

# 37. List Published Articles

## Endpoint

```http
GET /api/articles
```

---

## Purpose

Returns publicly visible articles.

Drafts and archived articles are excluded.

---

## Authentication Required

No

---

## Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Pagination |
| limit | Number of results |
| search | Search title or summary |
| sort | newest, oldest |

Pagination support is recommended even in the MVP.

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "articles": []
  }
}
```

---

# 38. Get Single Article

## Endpoint

```http
GET /api/articles/:slug
```

---

## Purpose

Returns one published article.

The slug is used instead of the MongoDB ObjectId because it creates cleaner public URLs.

Example

```text
/articles/introduction-to-rest
```

instead of

```text
/articles/683fa4....
```

---

## Authentication Required

No

---

## Response Includes

- title
- summary
- content
- publisher
- currentVersion
- publishedAt

---

## Possible Errors

| Status | Reason |
|---------|--------|
|404|Article not found|
|404|Article not published|

---

# 39. Update Article

## Endpoint

```http
PATCH /api/articles/:id
```

---

## Purpose

Allows the article owner to edit a draft or published article.

---

## Authentication Required

Yes

---

## Authorization

The authenticated user must own the article.

---

## Editable Fields

- title
- summary
- content

The following fields cannot be edited directly:

- slug
- publisher
- currentVersion
- publishedAt
- createdAt

---

## Successful Response

```text
200 OK
```

---

## Possible Errors

| Status | Reason |
|---------|--------|
|401|Unauthenticated|
|403|Not article owner|
|404|Article not found|

---

# 40. Publish Article

## Endpoint

```http
PATCH /api/articles/:id/publish
```

---

## Purpose

Changes an article from draft to published.

Only published articles:

- appear publicly
- receive contribution requests

---

## Authentication Required

Yes

---

## Authorization

Only the article owner.

---

## Successful Response

```text
200 OK
```

The backend:

- changes status
- sets publishedAt if not already set

---

# 41. Archive Article

## Endpoint

```http
PATCH /api/articles/:id/archive
```

---

## Purpose

Archives an article.

Archived articles:

- disappear from public listings
- stop accepting new contributions
- preserve all history

---

## Authentication Required

Yes

---

## Authorization

Only the article owner.

---

## Successful Response

```text
200 OK
```

---

# 42. My Articles

## Endpoint

```http
GET /api/articles/me
```

---

## Purpose

Returns every article owned by the authenticated user.

Unlike the public endpoint, this includes:

- drafts
- published articles
- archived articles

---

## Authentication Required

Yes

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "drafts": [],
    "published": [],
    "archived": []
  }
}
```

---

# 43. Article Ownership Rules

The backend enforces the following rules.

Any authenticated user may:

- create an article

Only the owner may:

- edit the article
- publish the article
- archive the article
- review contributions
- accept contributions
- reject contributions
- request revisions

Any authenticated user except the owner may:

- submit contribution requests

Public users may:

- browse published articles
- read published articles

---

# 44. Article State Transitions

```text
draft
   │
   ▼
published
   │
   ├──────────────► archived
   │
   ▼
updated
```

Invalid transitions should be rejected by the service layer.

Examples:

```text
Archived article receiving new contributions

Draft article receiving contributions

Non-owner publishing article
```

---

# 45. Business Rules

The Articles module follows these rules.

- Every article has exactly one owner.
- Ownership cannot be transferred in the MVP.
- Slugs must remain unique.
- Draft articles are private.
- Published articles are publicly readable.
- Archived articles cannot receive new contributions.
- Only article owners may modify article metadata.
- Every accepted contribution increases the article version.
- Public readers never see draft articles.

=================================================
PART 6 — CONTRIBUTIONS API
=================================================

# 46. Contributions Overview

The Contribution module is the core feature of B HIVE MVP.

A contribution represents a proposed revision to another user’s published article.

Instead of directly modifying the article, the contributor submits:

- the proposed article content
- an explanation of the change
- the article version on which the proposal is based

The article publisher then reviews the proposal and may:

- accept it
- reject it
- request changes

Accepted contributions update the article and create a new immutable article version.

---

# 47. Contribution Lifecycle

A contribution follows this lifecycle:

```text
Submit Contribution
        │
        ▼
      pending
        │
        ├──────────────► accepted
        │
        ├──────────────► rejected
        │
        ├──────────────► withdrawn
        │
        ▼
changes_requested
        │
        ├──────────────► pending
        └──────────────► withdrawn
```

Terminal states:

```text
accepted
rejected
withdrawn
```

A contribution in a terminal state cannot be modified.

---

# 48. Contribution Endpoints

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/articles/:articleId/contributions` | Submit a contribution | Required |
| GET | `/api/contributions/me` | View my submitted contributions | Required |
| GET | `/api/articles/:articleId/contributions` | View contributions for my article | Required |
| GET | `/api/contributions/:id` | View one contribution | Required |
| PATCH | `/api/contributions/:id/resubmit` | Resubmit after changes requested | Required |
| PATCH | `/api/contributions/:id/withdraw` | Withdraw contribution | Required |
| PATCH | `/api/contributions/:id/request-changes` | Request contributor revisions | Required |
| PATCH | `/api/contributions/:id/reject` | Reject contribution | Required |
| PATCH | `/api/contributions/:id/accept` | Accept and merge contribution | Required |

---

# 49. Submit Contribution

## Endpoint

```http
POST /api/articles/:articleId/contributions
```

---

## Purpose

Creates a new contribution request for a published article.

The contributor edits a copy of the article and submits the proposed full Markdown content.

---

## Authentication Required

Yes

---

## Authorization

The authenticated user:

- must be active
- must not own the target article
- must be allowed to contribute to the article

---

## Request Parameters

```text
articleId
```

MongoDB ObjectId of the target article.

---

## Request Body

```json
{
  "proposedContent": "# Updated Article\n...",
  "message": "Clarified the explanation and added a practical example."
}
```

---

## Backend-Generated Fields

The frontend must not provide:

- `contributor`
- `originalContent`
- `baseVersion`
- `status`
- `reviewedBy`
- `reviewedAt`

The backend fetches the current article and stores:

```text
contributor = authenticated user
originalContent = current article content
baseVersion = current article version
status = pending
```

---

## Validation Rules

### proposedContent

- Required
- String
- Minimum meaningful length
- Must differ from the current article content
- Must not contain only whitespace changes

### message

- Required
- String
- 10–1000 characters
- Trim whitespace

---

## Business Rules

The backend must verify that:

- the article exists
- the article is published
- the article is not archived
- the contributor is not the article publisher
- proposed content differs from current content
- the user does not already have another active contribution for the article

Active statuses:

```text
pending
changes_requested
```

---

## Successful Response

HTTP Status:

```text
201 Created
```

Example:

```json
{
  "success": true,
  "message": "Contribution submitted successfully.",
  "data": {
    "contribution": {
      "id": "...",
      "article": "...",
      "contributor": "...",
      "baseVersion": 2,
      "status": "pending",
      "createdAt": "..."
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 400 | Validation failed |
| 400 | Proposed content contains no meaningful changes |
| 401 | Authentication required |
| 403 | User attempted to contribute to their own article |
| 404 | Article not found |
| 409 | Existing active contribution already exists |
| 422 | Article is not open for contributions |
| 500 | Internal server error |

---

# 50. View My Contributions

## Endpoint

```http
GET /api/contributions/me
```

---

## Purpose

Returns contribution requests submitted by the authenticated user.

---

## Authentication Required

Yes

---

## Query Parameters

| Parameter | Purpose |
|---|---|
| `status` | Filter by contribution status |
| `page` | Pagination |
| `limit` | Number of results |
| `sort` | `newest` or `oldest` |

---

## Response Includes

Each contribution summary may include:

- contribution ID
- article title
- article slug
- article publisher name
- contribution status
- contribution message
- review comment
- base version
- creation date
- last update date

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "contributions": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "pages": 0
    }
  }
}
```

---

# 51. View Contributions for an Owned Article

## Endpoint

```http
GET /api/articles/:articleId/contributions
```

---

## Purpose

Returns contribution requests submitted to an article owned by the authenticated user.

This endpoint supports the publisher review queue.

---

## Authentication Required

Yes

---

## Authorization

The authenticated user must own the article.

---

## Query Parameters

| Parameter | Purpose |
|---|---|
| `status` | Filter by status |
| `page` | Pagination |
| `limit` | Number of results |
| `sort` | `newest` or `oldest` |

---

## Response Includes

- contributor name
- contributor bio, where appropriate
- contribution message
- contribution status
- base version
- submitted date
- resubmission count

The full proposed content may be excluded from list responses and returned only by the contribution-detail endpoint.

---

## Possible Errors

| Status | Reason |
|---|---|
| 401 | Authentication required |
| 403 | User does not own the article |
| 404 | Article not found |
| 500 | Internal server error |

---

# 52. View One Contribution

## Endpoint

```http
GET /api/contributions/:id
```

---

## Purpose

Returns the complete contribution details.

---

## Authentication Required

Yes

---

## Authorization

The contribution may be viewed only by:

- the original contributor
- the owner of the related article

Other users must receive:

```text
403 Forbidden
```

---

## Response Includes

- contribution ID
- article information
- contributor information
- original content
- proposed content
- base article version
- current article version
- contribution message
- status
- review comment
- reviewer
- review timestamp
- resubmission count
- created and updated timestamps

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "contribution": {
      "id": "...",
      "article": {
        "id": "...",
        "title": "Understanding REST APIs",
        "slug": "understanding-rest-apis",
        "currentVersion": 2
      },
      "contributor": {
        "id": "...",
        "name": "Example User"
      },
      "baseVersion": 2,
      "originalContent": "...",
      "proposedContent": "...",
      "message": "...",
      "status": "pending",
      "reviewComment": "",
      "reviewedBy": null,
      "reviewedAt": null,
      "resubmissionCount": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

# 53. Request Changes

## Endpoint

```http
PATCH /api/contributions/:id/request-changes
```

---

## Purpose

Allows the article publisher to request revision before accepting or rejecting the contribution.

---

## Authentication Required

Yes

---

## Authorization

The authenticated user must own the related article.

---

## Allowed Current Status

```text
pending
```

---

## Request Body

```json
{
  "reviewComment": "Please add a reliable source for the new claim and shorten the conclusion."
}
```

---

## Validation Rules

### reviewComment

- Required
- String
- 5–1000 characters
- Trim whitespace

---

## Backend Changes

```text
status = changes_requested
reviewComment = submitted comment
reviewedBy = authenticated publisher
reviewedAt = current timestamp
```

---

## Successful Response

```text
200 OK
```

```json
{
  "success": true,
  "message": "Changes requested successfully.",
  "data": {
    "contribution": {
      "id": "...",
      "status": "changes_requested",
      "reviewComment": "..."
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 400 | Review comment missing |
| 401 | Authentication required |
| 403 | User does not own the article |
| 404 | Contribution not found |
| 409 | Contribution is not pending |
| 500 | Internal server error |

---

# 54. Resubmit Contribution

## Endpoint

```http
PATCH /api/contributions/:id/resubmit
```

---

## Purpose

Allows the original contributor to revise and resubmit a contribution after changes were requested.

---

## Authentication Required

Yes

---

## Authorization

Only the original contributor may resubmit.

---

## Allowed Current Status

```text
changes_requested
```

---

## Request Body

```json
{
  "proposedContent": "# Revised Article\n...",
  "message": "Added the requested source and shortened the conclusion."
}
```

---

## Validation Rules

- Proposed content is required.
- Proposed content must differ from the original article content.
- Proposed content should differ from the previous proposal.
- Message is required.
- Message must be 10–1000 characters.

---

## Backend Changes

```text
proposedContent = revised content
message = updated explanation
status = pending
reviewedBy = null
reviewedAt = null
resubmissionCount += 1
```

The most recent review comment may remain visible for context.

---

## Version Conflict Rule

Before resubmission, the backend should compare:

```text
contribution.baseVersion
article.currentVersion
```

If the article has changed, return:

```text
409 Conflict
```

The MVP should require the contributor to create a new contribution from the latest article instead of automatically rebasing the old one.

---

## Successful Response

```text
200 OK
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 400 | Validation failed |
| 401 | Authentication required |
| 403 | User is not the original contributor |
| 404 | Contribution not found |
| 409 | Contribution is not awaiting revision |
| 409 | Article version changed |
| 500 | Internal server error |

---

# 55. Withdraw Contribution

## Endpoint

```http
PATCH /api/contributions/:id/withdraw
```

---

## Purpose

Allows the contributor to withdraw an active contribution.

---

## Authentication Required

Yes

---

## Authorization

Only the original contributor may withdraw it.

---

## Allowed Current Statuses

```text
pending
changes_requested
```

---

## Request Body

No request body is required.

An optional reason may be supported later.

---

## Backend Changes

```text
status = withdrawn
```

The contribution remains in the database for historical purposes.

---

## Successful Response

```json
{
  "success": true,
  "message": "Contribution withdrawn successfully.",
  "data": {
    "contribution": {
      "id": "...",
      "status": "withdrawn"
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 401 | Authentication required |
| 403 | User is not the contributor |
| 404 | Contribution not found |
| 409 | Contribution cannot be withdrawn from its current state |
| 500 | Internal server error |

---

# 56. Reject Contribution

## Endpoint

```http
PATCH /api/contributions/:id/reject
```

---

## Purpose

Allows the article publisher to reject a pending contribution.

---

## Authentication Required

Yes

---

## Authorization

Only the owner of the related article may reject it.

---

## Allowed Current Status

```text
pending
```

---

## Request Body

```json
{
  "reviewComment": "The proposed change does not align with the scope of this article."
}
```

---

## Validation Rules

### reviewComment

- Required
- String
- 5–1000 characters
- Trim whitespace

---

## Backend Changes

```text
status = rejected
reviewComment = submitted comment
reviewedBy = authenticated publisher
reviewedAt = current timestamp
```

---

## Successful Response

```text
200 OK
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 400 | Review comment missing |
| 401 | Authentication required |
| 403 | User does not own the article |
| 404 | Contribution not found |
| 409 | Contribution is not pending |
| 500 | Internal server error |

---

# 57. Accept Contribution

## Endpoint

```http
PATCH /api/contributions/:id/accept
```

---

## Purpose

Accepts the proposed content, updates the article, creates a new version, and marks the contribution as accepted.

This is the most important transaction in the MVP.

---

## Authentication Required

Yes

---

## Authorization

Only the owner of the related article may accept it.

---

## Allowed Current Status

```text
pending
```

---

## Optional Request Body

```json
{
  "reviewComment": "Accepted. This improves clarity and adds a useful example."
}
```

The review comment is optional for acceptance.

---

## Pre-Acceptance Checks

The backend must verify:

1. Contribution exists.
2. Contribution status is `pending`.
3. Related article exists.
4. Authenticated user owns the article.
5. Article is still published.
6. Contributor is not the article owner.
7. Proposed content differs from current article content.
8. Contribution base version matches article current version.

Required version condition:

```text
contribution.baseVersion === article.currentVersion
```

If this condition fails, return:

```text
409 Conflict
```

---

## Transactional Changes

The following changes must occur atomically:

1. Preserve the current article snapshot where required.
2. Replace article content with proposed content.
3. Increase `currentVersion`.
4. Create a new ArticleVersion.
5. Link the version to the accepted contribution.
6. Store the contributor as `createdBy`.
7. Store the publisher as `approvedBy`.
8. Mark the contribution as accepted.
9. Store reviewer metadata.

If any step fails, all changes must be rolled back.

---

## Version Record

The new ArticleVersion should contain:

```text
article
versionNumber
title
summary
content
createdBy = contributor
approvedBy = article publisher
sourceContribution = accepted contribution
changeType = accepted_contribution
changeDescription
createdAt
```

---

## Successful Response

```text
200 OK
```

```json
{
  "success": true,
  "message": "Contribution accepted and merged successfully.",
  "data": {
    "article": {
      "id": "...",
      "slug": "...",
      "currentVersion": 3,
      "updatedAt": "..."
    },
    "contribution": {
      "id": "...",
      "status": "accepted",
      "reviewedAt": "..."
    },
    "version": {
      "versionNumber": 3,
      "changeType": "accepted_contribution"
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 401 | Authentication required |
| 403 | User does not own the article |
| 404 | Contribution or article not found |
| 409 | Contribution is not pending |
| 409 | Article version conflict |
| 422 | Article is not in an acceptable state |
| 500 | Transaction failed |

---

# 58. Contribution Access Rules

## Public Visitor

May not:

- submit contributions
- view private contribution details
- review contributions

---

## Authenticated User

May:

- contribute to another user’s published article
- view their own contributions
- revise their own contribution when changes are requested
- withdraw their own active contribution

---

## Article Publisher

May:

- view contributions submitted to their articles
- request changes
- reject contributions
- accept contributions

The article publisher may not submit a contribution to their own article.

Direct article editing already provides that capability.

---

# 59. Contribution State Transition Rules

| Current State | Action | New State | Allowed Actor |
|---|---|---|---|
| `pending` | Accept | `accepted` | Article publisher |
| `pending` | Reject | `rejected` | Article publisher |
| `pending` | Request changes | `changes_requested` | Article publisher |
| `pending` | Withdraw | `withdrawn` | Contributor |
| `changes_requested` | Resubmit | `pending` | Contributor |
| `changes_requested` | Withdraw | `withdrawn` | Contributor |

All other transitions must be rejected.

---

# 60. Contribution Business Rules

The Contribution module must enforce the following:

- A contribution may target only a published article.
- A user may not contribute to their own article.
- The backend captures the original article content.
- Proposed content must contain meaningful changes.
- Only one active contribution per user per article is allowed.
- Only the original contributor may revise or withdraw a contribution.
- Only the article publisher may review a contribution.
- A rejected, accepted, or withdrawn contribution cannot be reopened.
- Acceptance requires an exact base-version match.
- Acceptance must use a MongoDB transaction.
- Accepted contributions create immutable article versions.
- Historical contribution records must not be deleted during normal operation.

---

# 61. Concurrency and Conflict Handling

A contribution becomes outdated when the target article changes after submission.

Example:

```text
Contribution base version: 2
Current article version: 3
```

The backend must not merge it automatically.

It should return:

```text
409 Conflict
```

Recommended response:

```json
{
  "success": false,
  "message": "The article changed after this contribution was submitted. Create a new proposal from the latest article version.",
  "errors": [
    {
      "code": "ARTICLE_VERSION_CONFLICT"
    }
  ]
}
```

Automatic rebasing and three-way merging are outside the MVP.

---

# 62. Contribution Deletion Policy

Contribution records should not be permanently deleted through normal user-facing endpoints.

Instead:

```text
pending or changes_requested → withdrawn
```

This preserves:

- contributor history
- review history
- auditability
- article attribution

Administrative deletion may be considered later for privacy, abuse, or legal requirements.

=================================================
PART 7 — ARTICLE VERSION HISTORY API
=================================================

# 63. Version History Overview

The Article Version module preserves the historical state of an article.

A new version is created whenever:

- an article is initially created
- the article publisher manually updates the article
- a contribution is accepted and merged

Each ArticleVersion stores a complete snapshot of:

- title
- summary
- content
- version number
- creator
- approving publisher, where applicable
- source contribution, where applicable
- change description
- creation time

Version records are immutable.

They may be read but should not be edited or deleted through normal API endpoints.

---

# 64. Versioning Goals

The versioning system provides:

- auditability
- historical comparison
- contribution attribution
- recovery support
- transparent article evolution
- version conflict detection

The MVP stores complete article snapshots rather than only storing differences.

This makes version retrieval and restoration simpler.

---

# 65. Version Creation Rules

A version should be created in the following situations.

## Initial Article Version

Created when the article is first stored.

Recommended values:

```text
versionNumber = 1
changeType = initial
createdBy = article publisher
approvedBy = null
sourceContribution = null
```

---

## Manual Article Edit

Created when the article publisher directly updates the article.

Recommended values:

```text
versionNumber = previous version + 1
changeType = manual_edit
createdBy = article publisher
approvedBy = null
sourceContribution = null
```

---

## Accepted Contribution

Created when a contribution is accepted.

Recommended values:

```text
versionNumber = previous version + 1
changeType = accepted_contribution
createdBy = contributor
approvedBy = article publisher
sourceContribution = accepted contribution
```

---

# 66. Version Endpoints

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/articles/:articleId/versions` | List article version history | Depends on article visibility |
| GET | `/api/articles/:articleId/versions/:versionNumber` | View one historical version | Depends on article visibility |
| GET | `/api/articles/:articleId/versions/compare` | Compare two versions | Optional for MVP |
| POST | `/api/articles/:articleId/versions/:versionNumber/restore` | Restore an older version | Future scope |

The first two endpoints are required for the MVP.

Version comparison may be implemented on the frontend using content returned by the API.

Restoration is excluded from the initial version.

---

# 67. List Article Versions

## Endpoint

```http
GET /api/articles/:articleId/versions
```

---

## Purpose

Returns the version history of an article.

---

## Authentication Required

Depends on the article state.

### Published Article

Version history may be publicly visible.

### Draft or Archived Article

Only the article publisher may access version history.

Recommended MVP policy:

- Public users may view versions of published articles.
- Only the publisher may view versions of draft or archived articles.

---

## Request Parameters

```text
articleId
```

MongoDB ObjectId of the article.

---

## Query Parameters

| Parameter | Purpose |
|---|---|
| `page` | Pagination |
| `limit` | Number of records |
| `sort` | `newest` or `oldest` |

Recommended default:

```text
sort = newest
```

---

## Response Content

The list response should return version summaries rather than full content.

Each version summary may include:

- version number
- change type
- change description
- created by
- approved by
- source contribution ID
- creation timestamp

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "article": {
      "id": "...",
      "title": "Understanding REST APIs",
      "slug": "understanding-rest-apis",
      "currentVersion": 3
    },
    "versions": [
      {
        "versionNumber": 3,
        "changeType": "accepted_contribution",
        "changeDescription": "Clarified the explanation and added an example.",
        "createdBy": {
          "id": "...",
          "name": "Contributor Name"
        },
        "approvedBy": {
          "id": "...",
          "name": "Publisher Name"
        },
        "sourceContribution": "...",
        "createdAt": "..."
      },
      {
        "versionNumber": 2,
        "changeType": "manual_edit",
        "changeDescription": "Updated article introduction.",
        "createdBy": {
          "id": "...",
          "name": "Publisher Name"
        },
        "approvedBy": null,
        "sourceContribution": null,
        "createdAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 400 | Invalid article ID |
| 403 | User cannot view private article history |
| 404 | Article not found |
| 500 | Internal server error |

---

# 68. View One Article Version

## Endpoint

```http
GET /api/articles/:articleId/versions/:versionNumber
```

---

## Purpose

Returns the complete snapshot of one article version.

---

## Authentication Required

Depends on article visibility.

The same visibility rules used for version listing should apply.

---

## Request Parameters

```text
articleId
versionNumber
```

Example:

```http
GET /api/articles/64f.../versions/2
```

---

## Validation Rules

### articleId

- Must be a valid MongoDB ObjectId.

### versionNumber

- Must be a positive integer.
- Must be at least 1.

---

## Response Includes

- article ID
- article slug
- version number
- title
- summary
- content
- change type
- change description
- created by
- approved by
- source contribution
- creation timestamp

---

## Successful Response

```json
{
  "success": true,
  "data": {
    "version": {
      "id": "...",
      "article": {
        "id": "...",
        "slug": "understanding-rest-apis"
      },
      "versionNumber": 2,
      "title": "Understanding REST APIs",
      "summary": "A beginner-friendly introduction to REST APIs.",
      "content": "# Introduction\n...",
      "changeType": "manual_edit",
      "changeDescription": "Updated the introduction.",
      "createdBy": {
        "id": "...",
        "name": "Publisher Name"
      },
      "approvedBy": null,
      "sourceContribution": null,
      "createdAt": "..."
    }
  }
}
```

---

## Possible Errors

| Status | Reason |
|---|---|
| 400 | Invalid article ID or version number |
| 403 | User cannot view this version |
| 404 | Article or version not found |
| 500 | Internal server error |

---

# 69. Compare Article Versions

## MVP Decision

The backend does not need to calculate text differences initially.

The frontend can retrieve two complete snapshots and use a diff-viewing library.

Example flow:

```text
Client requests version 2
        │
        ▼
Client requests version 3
        │
        ▼
Frontend diff component compares content
```

This keeps the backend simpler.

---

## Optional Comparison Endpoint

An optional endpoint may be added later:

```http
GET /api/articles/:articleId/versions/compare?from=2&to=3
```

Possible response:

```json
{
  "success": true,
  "data": {
    "fromVersion": {
      "versionNumber": 2,
      "content": "..."
    },
    "toVersion": {
      "versionNumber": 3,
      "content": "..."
    }
  }
}
```

The API would still return full snapshots rather than generating a rendered diff.

This endpoint is optional because the same result can be achieved using two version-detail requests.

---

# 70. Manual Article Update Versioning

When the article publisher updates an article through:

```http
PATCH /api/articles/:id
```

the backend should decide whether the update creates a new version.

Recommended MVP rule:

A new ArticleVersion is created only when at least one versioned field changes:

- title
- summary
- content

Changes to internal fields such as status should not automatically create a content version.

---

## Manual Update Transaction

A manual content update should perform the following:

1. Find the article.
2. Verify ownership.
3. Validate the proposed changes.
4. Determine whether versioned content changed.
5. Start a transaction if multiple writes are required.
6. Update the article.
7. Increase `currentVersion`.
8. Create an ArticleVersion snapshot.
9. Commit the transaction.

---

## Example Version Record

```text
changeType = manual_edit
createdBy = publisher
approvedBy = null
sourceContribution = null
changeDescription = publisher-provided description
```

The article update API may optionally accept:

```json
{
  "title": "...",
  "summary": "...",
  "content": "...",
  "changeDescription": "Updated the introduction and corrected an example."
}
```

The `changeDescription` is stored in the ArticleVersion but does not need to be stored on the Article itself.

---

# 71. Initial Version Creation

The versioning design must clearly define when version 1 is created.

Recommended MVP behaviour:

```text
Article creation
        │
        ▼
Article document created with currentVersion = 1
        │
        ▼
ArticleVersion 1 created immediately
```

This creates a complete history from the beginning.

The initial ArticleVersion should contain:

```text
versionNumber = 1
changeType = initial
changeDescription = Initial article version
createdBy = article publisher
approvedBy = null
sourceContribution = null
```

Article creation and initial-version creation should occur atomically.

---

# 72. Publishing and Version History

Publishing an article changes its visibility, not necessarily its content.

Recommended MVP rule:

```text
Publishing alone does not create a new ArticleVersion.
```

Reason:

- ArticleVersion records represent content snapshots.
- Publication status is stored on the Article.
- Creating a version without content changes would add noise.

If the publisher changes content and publishes it in the same operation, the content update should create a version.

---

# 73. Archiving and Version History

Archiving changes article status but does not modify historical content.

Recommended MVP rule:

```text
Archiving does not create a new ArticleVersion.
```

All historical versions remain preserved.

Archived articles should stop accepting new contributions.

---

# 74. Version Visibility Rules

## Published Article

Recommended access:

- Public visitors may view current content.
- Public visitors may view version history.
- Authenticated users may view version history.
- Article publisher may view all versions.

---

## Draft Article

Recommended access:

- Only the article publisher may view the draft.
- Only the article publisher may view its versions.

---

## Archived Article

Recommended access:

- Article publisher may view the article and its versions.
- Public visibility may be disabled.
- Contribution submission must be disabled.

---

# 75. Version Attribution Rules

Each ArticleVersion should clearly identify how it was produced.

## Initial Version

```text
createdBy = publisher
approvedBy = null
sourceContribution = null
```

---

## Manual Edit

```text
createdBy = publisher
approvedBy = null
sourceContribution = null
```

---

## Accepted Contribution

```text
createdBy = contributor
approvedBy = publisher
sourceContribution = contribution ID
```

This preserves both:

- who proposed the content
- who approved the merge

---

# 76. Version Conflict Detection

A contribution stores:

```text
baseVersion
```

An article stores:

```text
currentVersion
```

Before accepting a contribution:

```text
contribution.baseVersion === article.currentVersion
```

must be true.

Example conflict:

```text
Contribution baseVersion = 2
Article currentVersion = 3
```

Result:

```text
409 Conflict
```

The version API does not resolve the conflict.

The contributor must create a new proposal from the latest article content.

---

# 77. Version Immutability Rules

After an ArticleVersion is created:

- its title must not change
- its summary must not change
- its content must not change
- its version number must not change
- its attribution must not change
- its source contribution must not change
- it must not be deleted through normal endpoints

Historical records must represent the actual state of the article at that time.

---

# 78. Restore Version

Version restoration is excluded from the initial MVP.

A future endpoint may be:

```http
POST /api/articles/:articleId/versions/:versionNumber/restore
```

A restoration must not overwrite history.

Instead, it should:

1. Load the historical snapshot.
2. Create a new version using that content.
3. Increase the article current version.
4. Record the action as a restoration.

Possible future change type:

```text
restored_version
```

Example:

```text
Version 5 restores the content of version 2.
```

Version 2 remains unchanged.

---

# 79. Version Business Rules

The Version module must enforce the following rules:

- Every article begins with version 1.
- Version numbers increase sequentially.
- Version numbers never decrease.
- A version number is unique within an article.
- Historical versions are immutable.
- Accepted contributions create new versions.
- Manual content edits create new versions.
- Status-only updates do not create versions.
- One accepted contribution may create only one article version.
- Version creation and article updates must be atomic.
- Version history access follows article visibility rules.
- Automatic rollback is outside the MVP.

---

# 80. Version Storage Strategy

The MVP stores complete content snapshots.

Example:

```text
Version 1 → full article content
Version 2 → full article content
Version 3 → full article content
```

Benefits:

- simple retrieval
- easy comparison
- simple restoration
- reliable historical state
- lower implementation complexity

Trade-off:

- repeated content uses more storage

This trade-off is acceptable for the MVP because article documents are expected to remain relatively small.

Diff-based or compressed storage may be considered only if scale later requires it.

=================================================
PART 8 — API RESPONSE STANDARDS AND PAGINATION
=================================================

# 81. Response Standards Overview

B HIVE MVP should return predictable JSON responses across every endpoint.

A consistent response structure makes the API:

- easier to understand
- easier to test
- easier to integrate with the React frontend
- easier to debug
- easier to document
- less likely to require endpoint-specific frontend handling

The API should use separate standard formats for:

- successful single-resource responses
- successful list responses
- successful actions without substantial data
- validation errors
- authentication and authorization errors
- resource conflicts
- unexpected server errors

---

# 82. General Response Rules

Every API response should:

- use JSON
- include an appropriate HTTP status code
- include a boolean `success` field
- include a clear human-readable `message`
- include `data` for successful responses where applicable
- include `errors` for validation or structured failures where applicable
- avoid exposing internal implementation details

Every response should use:

```http
Content-Type: application/json
```

---

# 83. Standard Success Response

Use this structure when returning one resource or the result of an action:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `success` | Boolean | Yes | Indicates that the request succeeded |
| `message` | String | Yes | Human-readable result |
| `data` | Object or null | Yes | Response payload |

When no useful data must be returned:

```json
{
  "success": true,
  "message": "Contribution withdrawn successfully.",
  "data": null
}
```

Using `data: null` keeps the response structure predictable.

---

# 84. Resource Creation Response

Use:

```text
201 Created
```

for successful resource creation.

Example:

```json
{
  "success": true,
  "message": "Article created successfully.",
  "data": {
    "article": {
      "id": "68...",
      "title": "Understanding REST APIs",
      "slug": "understanding-rest-apis",
      "status": "draft",
      "currentVersion": 1,
      "createdAt": "2026-07-16T10:00:00.000Z"
    }
  }
}
```

Applicable endpoints include:

- user registration
- article creation
- contribution submission

---

# 85. Successful Action Response

Use this structure for actions such as:

- publishing an article
- archiving an article
- requesting contribution changes
- rejecting a contribution
- withdrawing a contribution
- accepting a contribution

Example:

```json
{
  "success": true,
  "message": "Article published successfully.",
  "data": {
    "article": {
      "id": "68...",
      "status": "published",
      "publishedAt": "2026-07-16T10:30:00.000Z"
    }
  }
}
```

---

# 86. Standard List Response

List endpoints should return:

```json
{
  "success": true,
  "message": "Articles retrieved successfully.",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

For resource-specific clarity, `items` may be replaced with the resource name.

Examples:

```json
{
  "data": {
    "articles": [],
    "pagination": {}
  }
}
```

```json
{
  "data": {
    "contributions": [],
    "pagination": {}
  }
}
```

Recommended project convention:

Use the specific plural resource name rather than a generic `items` field.

---

# 87. Pagination Standard

The following query parameters should be used consistently:

| Parameter | Type | Default | Maximum | Purpose |
|---|---|---:|---:|---|
| `page` | Positive integer | `1` | None | Requested page number |
| `limit` | Positive integer | `10` | `50` | Results per page |
| `sort` | String | Resource-specific | N/A | Sort order |

Example:

```http
GET /api/articles?page=2&limit=10&sort=newest
```

---

## Pagination Validation Rules

### `page`

```text
Must be an integer
Must be at least 1
Default: 1
```

### `limit`

```text
Must be an integer
Must be at least 1
Maximum: 50
Default: 10
```

If the client sends a value above the maximum, the backend may either:

- reject it with `400 Bad Request`, or
- cap it at 50

Recommended MVP behaviour:

```text
Reject invalid values with 400 Bad Request.
```

This makes client errors explicit.

---

## Pagination Calculation

The backend calculates:

```text
skip = (page - 1) × limit
```

Example:

```text
page = 3
limit = 10
skip = 20
```

---

## Pagination Metadata

Every paginated response should include:

| Field | Purpose |
|---|---|
| `page` | Current page |
| `limit` | Results per page |
| `totalItems` | Number of matching records |
| `totalPages` | Number of available pages |
| `hasNextPage` | Whether a later page exists |
| `hasPreviousPage` | Whether an earlier page exists |

Example:

```json
{
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalItems": 34,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

# 88. Empty List Responses

An empty result is normally not an error.

Example:

```http
GET /api/contributions/me?status=pending
```

If the user has no pending contributions, return:

```text
200 OK
```

```json
{
  "success": true,
  "message": "No contributions found.",
  "data": {
    "contributions": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

Do not return `404 Not Found` for a valid empty collection query.

---

# 89. Sorting Standard

Sort options should use clear predefined values.

## Articles

Recommended options:

```text
newest
oldest
recently_updated
```

Possible mappings:

```text
newest → publishedAt descending
oldest → publishedAt ascending
recently_updated → updatedAt descending
```

---

## Contributions

Recommended options:

```text
newest
oldest
recently_updated
```

Possible mappings:

```text
newest → createdAt descending
oldest → createdAt ascending
recently_updated → updatedAt descending
```

---

## Versions

Recommended options:

```text
newest
oldest
```

Possible mappings:

```text
newest → versionNumber descending
oldest → versionNumber ascending
```

Invalid sort values should return:

```text
400 Bad Request
```

---

# 90. Filtering Standard

Resource filters should be represented through query parameters.

Examples:

```http
GET /api/articles/me?status=draft
GET /api/contributions/me?status=pending
GET /api/articles/:articleId/contributions?status=changes_requested
```

The backend should define an allowlist for every endpoint.

Unexpected filters should either be ignored or rejected.

Recommended MVP behaviour:

```text
Reject unsupported filter values while ignoring unrelated unknown query parameters only if harmless.
```

For clearer contracts, validation should preferably reject invalid recognized parameters.

---

# 91. Search Standard

The public article endpoint may support:

```http
GET /api/articles?search=rest%20api
```

The search value should:

- be trimmed
- have a reasonable maximum length
- search only approved fields
- never be passed directly into unsafe database operations

Recommended MVP fields:

```text
title
summary
```

Full-text content search is outside the initial MVP unless specifically implemented.

Recommended maximum search length:

```text
100 characters
```

---

# 92. Field Naming Conventions

API response fields should use:

```text
camelCase
```

Examples:

```text
currentVersion
publishedAt
reviewComment
resubmissionCount
sourceContribution
```

Do not mix:

```text
snake_case
kebab-case
PascalCase
```

within JSON payloads.

MongoDB `_id` should be exposed to clients as:

```text
id
```

Recommended API response:

```json
{
  "id": "68..."
}
```

instead of:

```json
{
  "_id": "68..."
}
```

Internal database fields such as `__v` should never be exposed.

---

# 93. Date and Time Standard

All API timestamps should use ISO 8601 UTC strings.

Example:

```text
2026-07-16T11:20:35.000Z
```

Fields include:

- `createdAt`
- `updatedAt`
- `publishedAt`
- `archivedAt`
- `reviewedAt`

The backend stores and returns timestamps in UTC.

The frontend may convert them into the user's local time.

---

# 94. Null and Missing Fields

Use `null` when a known field exists but has no value.

Example:

```json
{
  "reviewedBy": null,
  "reviewedAt": null
}
```

Optional fields that are irrelevant to the response may be omitted.

Recommended rule:

- Use `null` for expected nullable resource fields.
- Omit internal or permission-restricted fields.
- Do not return empty strings where `null` better represents absence unless the schema intentionally stores an empty string.

---

# 95. Standard Error Response

Every error should follow:

```json
{
  "success": false,
  "message": "Request could not be completed.",
  "errors": []
}
```

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `success` | Boolean | Yes | Always `false` |
| `message` | String | Yes | Human-readable summary |
| `errors` | Array | Yes | Structured error details |

When no field-specific details exist:

```json
{
  "success": false,
  "message": "Article not found.",
  "errors": []
}
```

---

# 96. Validation Error Response

Use:

```text
400 Bad Request
```

Recommended response:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "title",
      "code": "TOO_SHORT",
      "message": "Title must contain at least 5 characters."
    },
    {
      "field": "summary",
      "code": "REQUIRED",
      "message": "Summary is required."
    }
  ]
}
```

Each validation error may contain:

| Field | Purpose |
|---|---|
| `field` | Request field that failed |
| `code` | Stable machine-readable error code |
| `message` | Human-readable explanation |

---

# 97. Authentication Error Response

Use:

```text
401 Unauthorized
```

Example:

```json
{
  "success": false,
  "message": "Authentication is required.",
  "errors": [
    {
      "code": "AUTHENTICATION_REQUIRED"
    }
  ]
}
```

For invalid login credentials:

```json
{
  "success": false,
  "message": "Invalid email or password.",
  "errors": [
    {
      "code": "INVALID_CREDENTIALS"
    }
  ]
}
```

The login response should not reveal whether the email or password was incorrect.

---

# 98. Authorization Error Response

Use:

```text
403 Forbidden
```

Example:

```json
{
  "success": false,
  "message": "You are not allowed to modify this article.",
  "errors": [
    {
      "code": "ARTICLE_OWNERSHIP_REQUIRED"
    }
  ]
}
```

Use `403` when:

- identity is known
- authentication succeeded
- the user lacks permission

---

# 99. Not Found Error Response

Use:

```text
404 Not Found
```

Example:

```json
{
  "success": false,
  "message": "Contribution not found.",
  "errors": [
    {
      "code": "CONTRIBUTION_NOT_FOUND"
    }
  ]
}
```

The backend may return `404` instead of `403` in some privacy-sensitive cases to avoid revealing the existence of a private resource.

The chosen behaviour should remain consistent per endpoint.

---

# 100. Conflict Error Response

Use:

```text
409 Conflict
```

for valid requests that conflict with current resource state.

Examples:

- duplicate email
- duplicate slug
- existing active contribution
- invalid contribution state transition
- article version conflict

Example:

```json
{
  "success": false,
  "message": "The article changed after this contribution was submitted.",
  "errors": [
    {
      "code": "ARTICLE_VERSION_CONFLICT",
      "details": {
        "baseVersion": 2,
        "currentVersion": 3
      }
    }
  ]
}
```

---

# 101. Unprocessable Resource Response

Use:

```text
422 Unprocessable Entity
```

when the request is structurally valid but cannot be processed because of a business rule.

Examples:

- submitting a contribution to an archived article
- publishing an incomplete article
- accepting a contribution while the article is not in an acceptable state

Example:

```json
{
  "success": false,
  "message": "Archived articles cannot receive contributions.",
  "errors": [
    {
      "code": "ARTICLE_NOT_OPEN_FOR_CONTRIBUTIONS"
    }
  ]
}
```

---

# 102. Rate Limit Response

Use:

```text
429 Too Many Requests
```

Example:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED"
    }
  ]
}
```

The response may include a `Retry-After` HTTP header where supported.

---

# 103. Internal Server Error Response

Use:

```text
500 Internal Server Error
```

Production response:

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "errors": [
    {
      "code": "INTERNAL_SERVER_ERROR"
    }
  ]
}
```

Do not expose:

- stack traces
- database query details
- MongoDB connection information
- environment variables
- JWT secrets
- source file paths

Detailed errors may be logged securely on the backend.

---

# 104. HTTP Status Code Summary

| Status | Meaning | Typical Use |
|---:|---|---|
| `200` | OK | Successful read, update or action |
| `201` | Created | Resource created |
| `204` | No Content | Optional successful deletion-style operation |
| `400` | Bad Request | Invalid request data or query parameters |
| `401` | Unauthorized | Missing, invalid or expired authentication |
| `403` | Forbidden | Authenticated but not permitted |
| `404` | Not Found | Resource or route not found |
| `409` | Conflict | Duplicate or state/version conflict |
| `422` | Unprocessable Entity | Business rule prevents processing |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected backend failure |

For consistency, the MVP may prefer `200` with a response body over `204` for withdrawal or archive actions.

---

# 105. Error Code Naming Convention

Machine-readable error codes should use:

```text
UPPER_SNAKE_CASE
```

Examples:

```text
VALIDATION_FAILED
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
USER_NOT_FOUND
EMAIL_ALREADY_EXISTS
ARTICLE_NOT_FOUND
ARTICLE_OWNERSHIP_REQUIRED
ARTICLE_NOT_PUBLISHED
ARTICLE_NOT_OPEN_FOR_CONTRIBUTIONS
CONTRIBUTION_NOT_FOUND
INVALID_CONTRIBUTION_STATUS
ARTICLE_VERSION_CONFLICT
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

Error codes should remain stable even if the human-readable message later changes.

---

# 106. Request ID

A future production enhancement may assign a unique ID to every request.

Example response:

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "errors": [
    {
      "code": "INTERNAL_SERVER_ERROR"
    }
  ],
  "requestId": "req_01J..."
}
```

This improves support and log tracing.

A request ID is optional for the MVP.

---

# 107. Response Data Exposure Rules

The API must never return:

- password hashes
- JWT secrets
- MongoDB connection strings
- raw authentication headers
- internal Mongoose fields such as `__v`
- private email addresses in public article responses
- unrelated private user fields
- full stack traces in production

Public user summaries should normally contain only:

```text
id
name
bio
```

Email should be returned only to the authenticated user through appropriate private endpoints.

---

# 108. Consistency Rules

All endpoints must follow these conventions:

- JSON uses camelCase.
- MongoDB `_id` is exposed as `id`.
- Dates use ISO 8601 UTC.
- Errors use the standard error structure.
- Lists include pagination metadata.
- Empty collections return `200`, not `404`.
- Human-readable messages remain concise.
- Machine-readable error codes remain stable.
- Internal implementation details are never exposed.
- HTTP status codes reflect the actual result.

=================================================
PART 9 — AUTHORIZATION & PERMISSION MATRIX
=================================================

# 109. Authorization Overview

Authentication answers:

> **Who is the user?**

Authorization answers:

> **Is the user allowed to perform this action?**

Authentication is handled using JWT.

Authorization is handled using:

- authenticated identity
- article ownership
- contribution ownership
- article status
- contribution status
- requested action

The frontend must never be trusted to determine permissions.

Every protected operation must be verified by the backend.

---

# 110. Authorization Strategy

B HIVE does not assign permanent Author or Contributor roles.

Every authenticated user can:

- publish their own articles
- contribute to other users' articles

Permissions depend entirely on resource ownership.

Example:

```text
User A owns Article X

↓

User A
can

Edit
Publish
Archive
Review Contributions

↓

User B

cannot

Edit
Publish
Archive

↓

User B

can

Read
Contribute
```

---

# 111. Permission Matrix

| Action | Public | Authenticated User | Article Owner |
|---------|:------:|:------------------:|:-------------:|
| Register | ✅ | — | — |
| Login | ✅ | — | — |
| Browse Published Articles | ✅ | ✅ | ✅ |
| Read Published Article | ✅ | ✅ | ✅ |
| Create Article | ❌ | ✅ | ✅ |
| View Own Drafts | ❌ | ❌ | ✅ |
| Edit Own Article | ❌ | ❌ | ✅ |
| Publish Article | ❌ | ❌ | ✅ |
| Archive Article | ❌ | ❌ | ✅ |
| Submit Contribution | ❌ | ✅* | ❌ |
| Withdraw Own Contribution | ❌ | ✅ | ❌ |
| Resubmit Contribution | ❌ | ✅ | ❌ |
| View Own Contributions | ❌ | ✅ | ❌ |
| View Contributions on Article | ❌ | ❌ | ✅ |
| Accept Contribution | ❌ | ❌ | ✅ |
| Reject Contribution | ❌ | ❌ | ✅ |
| Request Changes | ❌ | ❌ | ✅ |
| View Version History | Published Only | Published Only | All Versions |

\* Only for articles owned by another user.

---

# 112. Ownership Rules

Ownership is determined by document references.

## Article

```text
Article.publisher

==

Authenticated User ID
```

The authenticated user owns the article.

---

## Contribution

```text
Contribution.contributor

==

Authenticated User ID
```

The authenticated user owns the contribution.

---

Ownership checks should always compare ObjectIds rather than trusting request parameters.

---

# 113. Article Authorization Rules

A user may create unlimited articles.

A user may edit only articles they own.

A user may publish only articles they own.

A user may archive only articles they own.

A user cannot transfer article ownership in the MVP.

---

# 114. Contribution Authorization Rules

A user may submit a contribution only if:

- authenticated
- article exists
- article is published
- article is owned by another user
- user has no active contribution on that article

The backend rejects attempts to contribute to:

- draft articles
- archived articles
- own articles

---

# 115. Review Authorization

Only the article owner may review contributions.

The reviewer may:

- accept
- reject
- request changes

Nobody else can perform review actions.

---

# 116. Contribution Ownership Rules

Only the original contributor may:

- withdraw
- resubmit

Even the article owner cannot modify the contributor's proposal.

Instead they must:

- accept
- reject
- request revisions

---

# 117. Article Visibility

Draft

Visible only to owner.

Published

Visible to everyone.

Archived

Hidden from public browsing.

---

# 118. Contribution Visibility

Public visitors

Cannot see contributions.

Contributor

Can see:

- their own contributions

Article Owner

Can see:

- contributions submitted to their articles

Other authenticated users

Cannot access unrelated contributions.

---

# 119. Version Visibility

Published Articles

Anyone may view version history.

Draft Articles

Only publisher.

Archived Articles

Only publisher.

---

# 120. Middleware Responsibilities

The backend should separate middleware responsibilities.

## Authentication Middleware

Responsibilities:

- Verify JWT
- Verify signature
- Verify expiration
- Load user
- Verify active account
- Attach user to request

---

## Article Ownership Middleware

Responsibilities:

- Find article
- Verify article exists
- Verify requester owns article

---

## Contribution Ownership Middleware

Responsibilities:

- Find contribution
- Verify contribution exists
- Verify requester submitted it

---

## Review Permission Middleware

Responsibilities:

- Find contribution
- Load article
- Verify requester owns article

---

# 121. Forbidden Operations

The backend must reject:

Contributor editing article directly

Publisher submitting contribution to own article

Contributor accepting contribution

Contributor rejecting contribution

Public creating articles

Public submitting contributions

Public viewing drafts

Publisher editing someone else's article

Contributor viewing another contributor's proposal

---

# 122. Security Principles

Authorization should always be enforced on the backend.

The frontend:

- hides buttons
- improves user experience

The backend:

- enforces permissions

Even if a malicious user manually sends requests using:

- Postman
- curl
- browser developer tools

the backend must reject unauthorized actions.

Authorization must never rely on frontend behaviour.

---

# 123. Authorization Decision Flow

```text
Incoming Request
        │
        ▼
JWT Present?
        │
   No ─────► 401

        │
       Yes
        │
        ▼
JWT Valid?
        │
   No ─────► 401

        │
       Yes
        │
        ▼
Load User
        │
        ▼
User Active?
        │
   No ─────► 403

        │
       Yes
        │
        ▼
Load Resource
        │
        ▼
Exists?
        │
   No ─────► 404

        │
       Yes
        │
        ▼
Ownership Check
        │
   Failed ───► 403

        │
      Passed
        │
        ▼
Business Rules
        │
   Failed ───► 409 / 422

        │
      Passed
        │
        ▼
Controller Executes
```

---

# 124. Authorization Principles

The Authorization module follows these principles:

- Authentication always happens before authorization.
- Permissions depend on ownership, not permanent roles.
- Every protected endpoint validates permissions.
- Authorization logic belongs in middleware and services.
- Public endpoints never expose private resources.
- Ownership checks are based on database records.
- Invalid permissions return appropriate HTTP status codes.
- Frontend restrictions never replace backend validation.
- Authorization must remain consistent across all endpoints.

=================================================
PART 10 — VALIDATION RULES & BUSINESS LOGIC
=================================================

# 125. Validation Overview

Validation ensures that incoming requests are:

- structurally correct
- complete
- safe to process
- consistent with business rules

B HIVE performs validation at multiple levels.

```text
Incoming Request
        │
        ▼
Request Validation
        │
        ▼
Authentication
        │
        ▼
Authorization
        │
        ▼
Business Rule Validation
        │
        ▼
Database Operation
```

Each layer has a different responsibility.

---

# 126. Validation Layers

## Layer 1 — Request Validation

Checks:

- Required fields
- Data types
- Length limits
- Enum values
- Email format
- Query parameters

Example:

```json
{
    "title": ""
}
```

↓

```text
400 Bad Request
```

---

## Layer 2 — Authentication Validation

Checks:

- JWT exists
- JWT is valid
- JWT not expired
- User exists
- User account active

---

## Layer 3 — Authorization Validation

Checks:

- Resource ownership
- Permission to perform action
- Resource visibility

---

## Layer 4 — Business Validation

Checks relationships between resources.

Examples:

- Article is published
- User isn't article owner
- Version matches
- Contribution status allows transition

---

# 127. User Validation Rules

## Name

Required

Type:

```text
String
```

Validation:

- Minimum 2 characters
- Maximum 80 characters
- Trim whitespace
- Cannot contain only spaces

---

## Email

Validation:

- Required
- Valid email
- Lowercase
- Trim whitespace
- Unique

Examples:

Valid

```text
user@example.com
```

Invalid

```text
user
abc
```

---

## Password

Validation:

Minimum:

```text
8 characters
```

Maximum:

```text
128 characters
```

Should contain at least:

- one uppercase letter
- one lowercase letter
- one number

Special characters are recommended but optional for MVP.

---

# 128. Article Validation

## Title

Validation

- Required
- String
- Trim
- Minimum 5 characters
- Maximum 180 characters

---

## Summary

Validation

- Required
- Minimum 20 characters
- Maximum 500 characters

---

## Content

Validation

- Required
- Markdown string
- Minimum 50 characters
- Maximum size determined by server limits

---

## Slug

Never accepted from frontend.

Generated automatically.

Must be

- unique
- lowercase
- URL-safe

---

## Status

Allowed values

```text
draft
published
archived
```

Any other value:

```text
400 Bad Request
```

---

# 129. Contribution Validation

## Message

Validation

- Required
- Trim
- Minimum 10 characters
- Maximum 1000 characters

---

## Proposed Content

Validation

- Required
- Markdown
- Meaningful changes
- Different from current article

Whitespace-only edits should be rejected.

---

## Base Version

Never accepted from frontend.

Backend obtains it from article.

---

# 130. Query Validation

## Pagination

Page

```text
Minimum 1
```

Limit

```text
1–50
```

---

## Sort

Articles

```text
newest
oldest
recently_updated
```

Contributions

```text
newest
oldest
recently_updated
```

Versions

```text
newest
oldest
```

Unknown sort values

↓

400

---

## Search

Maximum

```text
100 characters
```

Trim whitespace.

Reject empty search strings after trimming.

---

# 131. ObjectId Validation

Before querying MongoDB:

Every ObjectId must be validated.

Affected endpoints include:

```text
articles/:id

contributions/:id

users/:id
```

Invalid ObjectId

↓

```text
400 Bad Request
```

instead of allowing Mongoose CastErrors.

---

# 132. State Validation

## Article States

```text
draft

published

archived
```

Rules

Draft

↓

Can edit

Cannot receive contributions

Published

↓

Public

Accept contributions

Archived

↓

Read only

No contributions

---

## Contribution States

```text
pending

changes_requested

accepted

rejected

withdrawn
```

Only legal transitions are allowed.

---

# 133. Ownership Validation

Article ownership

```text
Article.publisher

==

Authenticated User
```

Contribution ownership

```text
Contribution.contributor

==

Authenticated User
```

Never trust IDs coming from frontend.

Always verify using database records.

---

# 134. Business Rules

The backend must reject:

Submitting contribution to own article

Submitting contribution to draft article

Submitting contribution to archived article

Submitting identical content

Accepting rejected contribution

Rejecting accepted contribution

Updating withdrawn contribution

Publishing someone else's article

Editing another user's article

---

# 135. Version Validation

Before accepting contribution

Verify

```text
Contribution.baseVersion

==

Article.currentVersion
```

Mismatch

↓

```text
409 Conflict
```

Automatic merge is outside MVP.

---

# 136. Duplicate Submission Rules

One contributor

↓

One article

↓

One active contribution

Allowed statuses

```text
pending

changes_requested
```

Attempting another active contribution

↓

409 Conflict

---

# 137. Transaction Validation

Accept Contribution

Requires

MongoDB Transaction

Operations:

Update article

+

Create version

+

Update contribution

All succeed

OR

All rollback

---

# 138. Server-side Data Generation

The client must never send:

- publisher
- contributor
- reviewedBy
- reviewedAt
- currentVersion
- slug
- originalContent
- createdAt
- updatedAt

The backend generates these values.

---

# 139. Validation Principles

The validation system follows these principles:

- Validate early.
- Reject invalid requests before database operations.
- Never trust client-generated identifiers.
- Separate request validation from business validation.
- Prevent invalid state transitions.
- Keep validation rules deterministic.
- Return structured validation errors.
- Avoid leaking internal implementation details.
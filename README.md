# B HIVE MVP

A MERN-stack collaborative publishing MVP where authors publish articles and contributors propose improvements through structured contribution requests.

Authors can review proposed changes, compare them with the current article, and accept, reject, or request revisions. Accepted contributions update the article and create a version record.

## Project Status

This project is currently under active development.

The first development phase focuses on building and testing the backend REST API.

## Problem

Readers frequently identify improvements that could be made to published articles, including:

* clearer explanations
* corrected information
* stronger supporting content
* improved structure
* additional context
* corrected grammar
* updated examples

Traditional publishing systems usually provide comments, but they do not offer a structured workflow through which a contributor can propose a complete revision and an author can review and merge it.

This MVP explores a Git-inspired contribution workflow for written content.

## MVP Objective

The purpose of the MVP is to validate one central workflow:

1. An author creates and publishes an article.
2. A contributor reads the article.
3. The contributor proposes an edited version.
4. The contributor explains the proposed change.
5. The author reviews the original and proposed versions.
6. The author accepts, rejects, or requests changes.
7. An accepted contribution updates the article.
8. The previous article version remains available.

The MVP does not attempt to recreate the complete Git or GitHub experience.

## User Roles

### Contributor

A contributor can:

* register and log in
* browse published articles
* read an article
* propose changes to an article
* explain the reason for the contribution
* view submitted contribution requests
* track contribution status
* revise a contribution when changes are requested

### Author

An author can:

* register and log in
* create an article
* save an article as a draft
* edit their own article
* publish an article
* view contribution requests submitted to their articles
* compare the current and proposed article content
* accept a contribution
* reject a contribution
* request changes
* view article version history

## Core MVP Features

* User registration and login
* Contributor and author roles
* JWT-based authentication
* Author-owned articles
* Draft and published article states
* Public article browsing
* Contribution request submission
* Original and proposed content storage
* Contribution review statuses
* Author authorization
* Contribution acceptance and merging
* Article version records
* Version-conflict detection
* REST API
* MongoDB persistence

## Contribution Statuses

A contribution can have one of the following statuses:

* `pending`
* `changes_requested`
* `accepted`
* `rejected`
* `withdrawn`

## Article Statuses

An article can have one of the following statuses:

* `draft`
* `published`
* `archived`

## MVP Workflow

### Contributor workflow

1. Create an account or log in.
2. Browse published articles.
3. Open an article.
4. Select “Suggest an Edit.”
5. Edit a copy of the current article.
6. Add an explanation.
7. Submit the contribution request.
8. Track the review status.

### Author workflow

1. Create an account or log in.
2. Create and publish an article.
3. Open the article’s contribution requests.
4. Review the contributor’s explanation.
5. Compare the existing article with the proposed version.
6. Accept, reject, or request changes.
7. If accepted, merge the proposed content and create an article version.

## Technology Stack

### Backend

* Node.js
* Express.js
* MongoDB
* MongoDB Atlas
* Mongoose

### Authentication and Security

* JSON Web Tokens
* bcrypt
* Helmet
* CORS
* request validation
* API rate limiting

### Frontend

The frontend will be added after the backend API is complete.

Planned frontend stack:

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Markdown rendering
* Visual text-diff component

## Repository Structure

```text
knowledge-contribution-mvp/
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
├── client/
├── .gitignore
├── README.md
└── LICENSE
```

## Planned Backend Modules

### Authentication module

Responsible for:

* registration
* login
* password hashing
* token generation
* current-user retrieval
* authentication middleware

### Article module

Responsible for:

* article creation
* article editing
* draft management
* publishing
* article ownership
* public article retrieval

### Contribution module

Responsible for:

* contribution submission
* contributor history
* author review
* status transitions
* rejection
* revision requests
* acceptance and merging

### Version module

Responsible for:

* article version creation
* version history
* accepted-contribution references
* version-conflict detection

## Planned Data Models

The MVP will initially use four primary MongoDB collections:

* users
* articles
* contributions
* article versions

## Backend Development Roadmap

### Phase 1 — Foundation

* Initialize the Node.js project
* Configure Express
* Configure environment variables
* Connect MongoDB Atlas
* Add central error handling
* Add basic security middleware

### Phase 2 — Authentication

* User model
* Registration
* Login
* JWT authentication
* Role authorization
* Current-user endpoint

### Phase 3 — Articles

* Create article
* Edit owned article
* Publish article
* List published articles
* View article details
* List author-owned articles

### Phase 4 — Contributions

* Submit contribution request
* Store original content
* Store proposed content
* List contributor submissions
* List article contribution requests
* Review contribution details

### Phase 5 — Review and Merge

* Reject contribution
* Request changes
* Resubmit contribution
* Accept and merge contribution
* Create version record
* Detect version conflicts

### Phase 6 — Testing and Deployment

* Authentication testing
* Authorization testing
* Article API testing
* Contribution workflow testing
* MongoDB Atlas deployment configuration
* Backend hosting
* API documentation

## Environment Variables

The backend will require:

* `PORT`
* `NODE_ENV`
* `MONGODB_URI`
* `JWT_SECRET`
* `JWT_EXPIRES_IN`
* `CLIENT_URL`

Actual environment values must never be committed to Git.

## Local Development

Detailed setup instructions will be added as backend modules are implemented.

The expected workflow will be:

1. Clone the repository.
2. Enter the server directory.
3. Install dependencies.
4. Create a local `.env` file.
5. add the MongoDB Atlas connection string.
6. Start the development server.

## Non-Goals for the MVP

The following are intentionally excluded from the first version:

* AI contribution filtering
* plagiarism detection
* citation verification
* knowledge graphs
* article freshness scoring
* real-time collaborative editing
* Git branches
* automatic merge-conflict resolution
* institutional accounts
* multiple article maintainers
* research recruitment
* résumé uploads
* public contributor reputation scores
* contribution certificates
* notifications
* payments
* social feeds
* journalism-specific verification workflows

## Future Scope

Possible future development may include:

### Structured article sections

Allow contributors to propose changes to individual article sections rather than editing the entire article.

### Multiple maintainers

Allow several authorized reviewers to manage one article or publication.

### Contributor profiles

Display accepted contributions, subject areas, reviewer feedback, and contribution history.

### AI-assisted preliminary checks

Provide non-binding checks for:

* grammar
* submission completeness
* likely relevance
* missing references
* duplicate content
* readability

AI should assist reviewers rather than silently reject contributors.

### Knowledge relationships

Connect related articles, concepts, evidence, datasets, and contributors through a knowledge graph.

### Article freshness

Indicate when sources, facts, statistics, or explanations may require review.

### Research collaboration

Support private, invite-only repositories for unpublished research and public contribution workflows for published work.

### Journalism workflows

Support fact-checking, source-verification records, corrections, editorial review, and protected contribution evidence.

### Opportunity and recruitment features

Allow authors, professors, editors, and organizations to discover contributors through verified accepted work.

### Advanced versioning

Possible later features include:

* section-level revisions
* comparison between arbitrary versions
* rollback
* multiple contribution branches
* conflict assistance
* contribution dependencies

## Security Considerations

The backend will enforce:

* password hashing
* authenticated protected routes
* article ownership checks
* contribution ownership checks
* author-only review actions
* request validation
* protected environment variables
* rate limiting
* secure HTTP headers
* controlled cross-origin access

The frontend will never be treated as the source of truth for authorization.

## License

A license will be selected before the repository is publicly released.

## Author

Purva Tripathi

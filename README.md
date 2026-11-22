# CareerForge — MERN Job Board

CareerForge is a full-stack job board built with MongoDB, Express, React, and Node.js. Candidates can discover jobs, upload resumes, apply, and track progress. Employers can manage listings, review candidates, update application status, and receive notifications. Admins can manage users and moderate listings.

The interface uses a responsive, feed-centered layout with a graphite background and lime accents. The frontend is a React single-page app; the backend exposes a JSON REST API.

## Features

### Candidates
- Search and filter published roles by keyword, location, job type, workplace mode, experience level, and salary.
- View job details and apply with a saved resume or an optional cover letter.
- Upload PDF, DOC, or DOCX resumes up to 5 MB; choose a default, download, or delete saved resumes.
- Track applications and status history.

### Employers
- Create, edit, publish, close, and delete job listings.
- Review applicants and access resumes only for applications to their own jobs.
- Update application statuses, add private notes, and view hiring statistics.

### Admins and notifications
- View platform statistics, manage users, and moderate job listings.
- Notifications are created when an application is submitted or its status changes. The client refreshes the notification list every 25 seconds while signed in.

## Stack and architecture

| Area | Implementation |
|---|---|
| Client | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide icons |
| API | Node.js, Express 4, ES modules |
| Database | MongoDB with Mongoose 8 |
| Authentication | bcryptjs password hashing and JWT bearer tokens |
| Resume storage | Multer local disk storage; files are not publicly served |

### Data model

- **User** represents candidates, employers, and admins using a `role` field. Candidate profile and employer/company fields live on the same schema.
- **Job** references its employer and stores role details, filters, salary, status, and view/application counts.
- **Resume** references its candidate and stores file metadata and the private upload path.
- **Application** references a job, candidate, employer, and resume. It keeps a resume snapshot and status history. A unique index on `(job, candidate)` prevents duplicate applications.
- **Notification** references its recipient and may point to the related job or application.

## Project layout

```text
client/
  src/api/             Axios client and API functions
  src/components/      Shared navigation, job cards, filters, and status UI
  src/context/         Authentication and notification state
  src/pages/           Public, candidate, employer, and admin pages
  src/index.css        Shared theme and responsive styling
server/
  src/config/          MongoDB and upload configuration
  src/controllers/     Request handling and business logic
  src/middleware/      Authentication, authorization, uploads, and errors
  src/models/          Mongoose schemas
  src/routes/          REST endpoint declarations
  src/utils/           Development database seeder
  uploads/resumes/     Private local resume files (ignored by Git)
```

## Run locally

### Requirements

- Node.js 18 or newer
- npm 9 or newer
- MongoDB for data that should persist across server restarts (local MongoDB or MongoDB Atlas)

### Install dependencies

From the project root:

```bash
npm run install-all
```

### Configure the environment

Copy `server/.env.example` to `server/.env`. For persistent local MongoDB, use settings such as:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/jobboard
USE_IN_MEMORY_DB=false
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads/resumes
MAX_FILE_SIZE_MB=5
```

Set `JWT_SECRET` to a private random value for your machine. Never use the example secret in a deployed environment. `client/.env.example` sets `VITE_API_URL=/api`; Vite proxies `/api` to the backend on port 5001 during development.

`USE_IN_MEMORY_DB=auto` attempts the configured MongoDB URI first and falls back to an in-memory MongoDB if it cannot connect. The memory server may download its MongoDB binary on first startup. **In-memory data is temporary and disappears when the server process exits.** The seed command runs in a separate process, so use persistent MongoDB when you want demo seed data available to the app after startup.

### Seed demo data (optional)

```bash
npm run seed
```

The seeder clears the selected database collections before inserting demo users, jobs, applications, notifications, and placeholder resume files. Use it only with a development database whose data can be replaced.

### Start the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API listens at [http://localhost:5001](http://localhost:5001); its health check is `GET /api/health`.

## Demo accounts

All seeded demo accounts use the password `Password123!`.

| Role | Email |
|---|---|
| Admin | `admin@jobboard.com` |
| Employer | `employer@techcorp.io` |
| Employer | `talent@innovate.co` |
| Candidate | `alex.chen@example.com` |
| Candidate | `elena.dev@example.com` |
| Candidate | `marcus.design@example.com` |

## REST API

Base path: `/api`. Protected routes require `Authorization: Bearer <token>`. Registration and login return a token. Responses use JSON and include a `success` field.

### Authentication — `/api/auth`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Create a candidate or employer account |
| POST | `/login` | Public | Authenticate and receive a JWT |
| GET | `/me` | Signed in | Get the current profile |
| PUT | `/profile` | Signed in | Update the current profile |
| PUT | `/change-password` | Signed in | Change password |

### Jobs — `/api/jobs`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Public | Search published jobs; supports `keyword`, `location`, `jobType`, `workplaceMode`, `experienceLevel`, `minSalary`, `maxSalary`, `sort`, `page`, and `limit` |
| GET | `/:id` | Public | Get job details; optionally includes the signed-in candidate's application status |
| POST | `/` | Employer/admin | Create a listing |
| PUT | `/:id` | Owner/admin | Update a listing |
| DELETE | `/:id` | Owner/admin | Delete a listing and related applications |
| GET | `/employer/my-jobs` | Employer/admin | List the current employer's jobs |
| GET | `/employer/stats` | Employer/admin | Get employer listing and application statistics |

Example search:

```text
GET /api/jobs?keyword=react&location=remote&jobType=full-time&sort=newest&page=1&limit=10
```

### Resumes — `/api/resumes`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | Candidate | Upload `resume` as multipart form data; optional `title` and `isDefault` fields |
| GET | `/` | Candidate | List the current candidate's resumes |
| PUT | `/:id/default` | Candidate | Set a resume as the default |
| DELETE | `/:id` | Owner/admin | Delete a resume |
| GET | `/:id/download` | Owner, related employer, or admin | Download a resume after authorization |

### Applications — `/api/applications`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | Candidate | Apply with `jobId`, `resumeId`, and optional `coverLetter` |
| GET | `/my-applications` | Candidate | List the current candidate's applications; supports `status`, `page`, and `limit` |
| GET | `/job/:jobId` | Job owner/admin | List applicants for a job; supports `status`, `search`, `page`, and `limit` |
| GET | `/employer/all` | Employer/admin | List applications received across the employer's jobs |
| GET | `/:id` | Authorized user | View an application |
| PATCH | `/:id/status` | Job owner/admin | Update status and add a status-history entry |
| PATCH | `/:id/notes` | Job owner/admin | Update internal employer notes |

Application statuses: `submitted`, `reviewing`, `shortlisted`, `rejected`, and `hired`.

### Notifications — `/api/notifications`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Signed in | List notifications and unread count |
| PATCH | `/read-all` | Signed in | Mark all notifications as read |
| PATCH | `/:id/read` | Owner | Mark one notification as read |
| DELETE | `/:id` | Owner | Delete one notification |

### Admin — `/api/admin`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/stats` | Admin | Platform statistics |
| GET | `/users` | Admin | Search and filter users |
| PATCH | `/users/:id/toggle-status` | Admin | Activate or deactivate a user |
| DELETE | `/users/:id` | Admin | Delete a user and associated records |
| GET | `/jobs` | Admin | List all jobs |
| PATCH | `/jobs/:id/status` | Admin | Change a job's status |

## Resume upload and access

Resume uploads accept `.pdf`, `.doc`, and `.docx` files up to `MAX_FILE_SIZE_MB` (5 MB by default). Multer validates MIME type and extension and stores files with generated filenames under `server/uploads/resumes/`. The folder is not mounted as a public static route. Downloads go through the authenticated API, which checks the resume owner, an employer with an application referencing that resume, or an admin.

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Run the API and Vite client together |
| `npm run server` | Run the API with nodemon |
| `npm run client` | Run the Vite client |
| `npm run seed` | Clear and seed the configured database |
| `npm run build` | Build the frontend into `client/dist` |
| `npm start` | Start the Node API (does not serve the React build) |

The frontend production build can be hosted as static files. Configure the hosting/reverse proxy so `/api` requests reach the Express server.

## Notes for contributors

- Keep role checks on server routes; hiding a client link is not authorization.
- Preserve the unique `(job, candidate)` application index when changing application logic.
- Resume files contain private candidate data; do not expose the upload directory as a public static folder.
- Notifications currently use periodic HTTP polling from the client, not WebSockets or server-sent events.
- There is no automated test suite configured in the project. `npm run build` checks that the frontend compiles.

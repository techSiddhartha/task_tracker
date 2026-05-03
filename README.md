# Team Task Manager

A production-ready full stack task management application with JWT authentication, role-based access control, project assignment, task tracking, overdue visibility, seed data, and Railway-friendly configuration.

## Project Structure

```text
team-task-manager/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── errorMiddleware.js
│       ├── models/
│       │   ├── Project.js
│       │   ├── Task.js
│       │   └── User.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── projectRoutes.js
│       │   ├── taskRoutes.js
│       │   └── userRoutes.js
│       ├── scripts/
│       │   └── seed.js
│       └── utils/
│           ├── ApiError.js
│           └── generateToken.js
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   └── client.js
│       ├── components/
│       │   ├── EmptyState.jsx
│       │   ├── Loader.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── StatusBadge.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── layouts/
│       │   └── AppLayout.jsx
│       ├── pages/
│       │   ├── AuthPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── ProjectsPage.jsx
│       │   └── TasksPage.jsx
│       └── utils/
│           ├── constants.js
│           └── helpers.js
├── .gitignore
└── README.md
```

## Backend First

### Core backend features

- JWT signup/login with bcrypt password hashing
- Role-based authorization middleware for `admin` and `member`
- REST APIs for `/api/auth`, `/api/projects`, `/api/tasks`, and `/api/users`
- Mongoose models for `User`, `Project`, and `Task`
- Seed script for demo users, projects, and overdue tasks
- Production-aware error handling and environment variable support

### Backend environment

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Backend install and run

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Backend API summary

#### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

#### Projects

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects` admin only
- `PUT /api/projects/:id` admin only
- `DELETE /api/projects/:id` admin only

#### Tasks

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks` admin only
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id` admin only

#### Users

- `GET /api/users` admin only
- `GET /api/users/:id` admin only
- `PUT /api/users/:id/role` admin only
- `DELETE /api/users/:id` admin only

### Sample API requests

Signup:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@teamtaskmanager.com",
    "password": "password123",
    "role": "admin"
  }'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Create project:

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mobile App Launch",
    "description": "Prepare the v1 release",
    "members": ["USER_ID_1", "USER_ID_2"]
  }'
```

Create task:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Finalize onboarding flow",
    "description": "Review copy and validation",
    "status": "To Do",
    "priority": "High",
    "dueDate": "2026-05-20",
    "assignedTo": "USER_ID_1",
    "projectId": "PROJECT_ID_1"
  }'
```

Update task status as member:

```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "Done"
  }'
```

### Seed data

Running `npm run seed` in `backend/` creates:

- Admin: `admin@example.com` / `password123`
- Member: `member1@example.com` / `password123`
- Member: `member2@example.com` / `password123`

## Frontend

### Core frontend features

- React + Vite + Tailwind CSS
- Auth context with token persistence
- Protected routing
- Login and signup pages with validation
- Dashboard with task summary and overdue highlights
- Projects page with admin create/edit/delete flow
- Tasks page with admin task creation and member status updates
- Axios API client with automatic JWT header injection
- Loading, empty, and error states

### Frontend environment

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

### Frontend install and run

```bash
cd frontend
npm install
npm run dev
```

## Role Logic

### Admin

- Manage users
- Create, update, and delete projects
- Assign project members
- Create and delete tasks
- Update any task status

### Member

- View assigned tasks
- View projects they belong to
- Update their own task status only

## Railway Deployment

Deploy backend and frontend as two Railway services from the same repo.

### Backend service

- Root directory: `backend`
- Start command: `npm start`
- Required variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`

### Frontend service

- Root directory: `frontend`
- Build command: `npm run build`
- Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- Required variables: `VITE_API_URL` pointing to the deployed backend `/api` URL

## Production Notes

- Store strong secrets in Railway environment variables, not in source control.
- Members are restricted server-side from editing anything except their own task status.
- Projects automatically include the admin creator in the member list.
- The dashboard highlights overdue tasks when due date is in the past and status is not `Done`.

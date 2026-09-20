# CampusHire – Recruitment Management System

CampusHire is a full-stack Recruitment Management System designed to manage the campus placement process for students, recruiters, and TPC administrators.

## 🚀 Features

### Student
- Student registration and login
- Profile management
- Resume upload and PDF parsing
- Resume skill extraction
- Job eligibility checking
- Placement drive applications
- Application status tracking
- Resume-job matching score

### Recruiter
- Recruiter registration
- Company management
- TPC Admin approval workflow
- Job creation and management
- View student applications
- Recruitment activity tracking

### TPC Admin
- Recruiter approval/rejection
- Job approval
- Company management
- Placement drive management
- Student and recruiter management
- Recruitment analytics
- Application monitoring

## 🔑 Demo Credentials

Use these credentials to explore the different roles in CampusHire.

| Role | Email | Password |
|---|---|---|
| **TPC Admin** | `admin@college.edu` | `Password@123` |
| **Recruiter** | `recruiter@google.com` | `Password@123` |
| **Student** | `rahul.sharma@college.edu` | `Password@123` |

> **Recruiter Note:** Recruiter accounts require TPC Admin approval before accessing recruiter functionality.

## 🔐 Authentication & Authorization

CampusHire uses JWT-based authentication and role-based access control.

**Roles**
- `STUDENT`
- `RECRUITER`
- `TPC_ADMIN`

### Recruiter Approval Flow

```text
Recruiter Registration
        ↓
      PENDING
        ↓
   TPC Admin Review
      ↙       ↘
 APPROVED   REJECTED
     ↓
Recruiter Dashboard
```

## 📄 Resume & ATS Matching

The system provides ATS-style resume matching by comparing candidate resume skills with job requirements.

```text
Resume Upload
     ↓
  PDF Parsing
     ↓
Text Extraction
     ↓
Skill Detection
     ↓
Job Skill Comparison
     ↓
Match Score
```

## 📊 Application Lifecycle

```text
APPLIED
   ↓
ELIGIBILITY_VERIFIED
   ↓
RESUME_MATCHED
   ↓
UNDER_REVIEW
   ↓
SHORTLISTED
   ↓
INTERVIEW_SCHEDULED
   ↓
INTERVIEW_COMPLETED
   ↓
OFFER_EXTENDED
   ↓
ACCEPTED / REJECTED
```

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS, Axios, React Router |
| Backend | Node.js, Express.js, REST APIs |
| Authentication | JWT, bcrypt |
| Database | PostgreSQL, Prisma ORM |
| Database Hosting | Neon PostgreSQL |
| Deployment | Render |

## 🗄️ Database Models

- User
- StudentProfile
- Company
- RecruiterProfile
- Job
- PlacementDrive
- ResumeVersion
- Application

## ⚙️ Local Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd campushire
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Configure Backend Environment Variables

Create a `.env` file inside the `server` folder:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

### 5. Configure Frontend Environment Variables

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL="http://localhost:5000/api"
```

For production:

```env
VITE_API_URL="https://your-backend-url.onrender.com/api"
```

### 6. Generate Prisma Client

From the `server` directory:

```bash
npx prisma generate
```

### 7. Run Database Migration

```bash
npx prisma migrate dev
```

### 8. Seed Demo Data

If the seed script is configured:

```bash
npx prisma db seed
```

### 9. Start Backend

From the `server` directory:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 10. Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🌐 Deployment

The project uses:

- **Frontend:** Render
- **Backend:** Render
- **Database:** Neon PostgreSQL

For the deployed frontend, set:

```env
VITE_API_URL="https://your-backend-url.onrender.com/api"
```

## 🔒 Environment Variables

Do not commit `.env` files or database credentials to GitHub.

Add the following to `.gitignore`:

```text
.env
.env.*
```

## 📌 Project Status

**Under Active Development**

The project is being continuously enhanced with additional recruitment management, analytics, and administrative features.

## 👩‍💻 Developer

**Tiyasha Bhattacharjee**

B.Tech – Electronics & Communication Engineering  
MAKAUT University

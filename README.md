# MediQueue – Smart Doctor Appointment and Queue System

**Final Year BCA Academic Project**  
*A complete, responsive, full-stack clinical appointment booking and real-time appointment-linked queue management web application.*

---

## 1. Project Overview & Architecture

**MediQueue** is an enterprise-grade academic full-stack web application designed to eliminate physical waiting room congestion in hospital Outpatient Departments (OPD) and clinics. The system links verified doctor appointments directly with a sequential queue engine, enabling patients to monitor their live queue position honestly before entering the clinic.

### Key Capabilities
- **Role-Based Portals**: Tailored workflows for **Patients**, **Doctors**, and **Administrators**.
- **Dynamic Slot Generation**: Consultation time slots are dynamically calculated based on weekly doctor shifts and slot durations (15/20/30/45 minutes).
- **ACID Double-Booking Prevention**: Database transactions with `FOR UPDATE` row-level locks prevent simultaneous bookings for the same doctor and slot.
- **Appointment-Linked Queue Engine**: Sequential queue tokens (`#1`, `#2`, `#3`...) are automatically assigned per doctor per date. Cancelled appointments release the slot and are removed from the active waiting line.
- **Live Queue Position Tracking**: Real-time display showing currently serving token number, waiting line position, and room alerts without misleading wait-time estimations.
- **RESTful Architecture & Security**: Strict JWT authentication tokens, bcrypt password hashing, input validation middleware, and parameterized SQL queries preventing SQL injection.

```
MediQueue/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool (mysql2/promise)
│   ├── controllers/
│   │   ├── adminController.js    # System analytics, doctors/patients CRUD, clinic settings
│   │   ├── appointmentController.js # Transaction-safe booking, history, cancellation
│   │   ├── authController.js     # Patient registration, multi-role login, JWT issuing
│   │   ├── doctorController.js   # Doctor directory, search/filters, availability slots
│   │   ├── patientController.js  # Patient profile & dashboard metrics
│   │   └── queueController.js    # Real-time queue tracker, call-next patient engine
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT bearer verification & role authorization (RBAC)
│   │   ├── errorHandler.js       # Centralized JSON error boundary & 404 handler
│   │   └── validationMiddleware.js # Input format, date validity, and schedule guards
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   └── queueRoutes.js
│   ├── utils/
│   │   ├── refGenerator.js       # Format: MQ-YYYYMMDD-XXXX
│   │   └── slotGenerator.js      # Dynamic time slot calculator & status detector
│   ├── tests/
│   │   ├── api.test.js           # Unit tests (slot engine, ref generator, RBAC, validators)
│   │   └── integration.test.js   # Express HTTP in-memory integration & security tests
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Express server bootstrap & router mounts
├── database/
│   ├── schema.sql                # Relational MySQL DDL (7 tables, foreign keys, constraints)
│   ├── seed.sql                  # Comprehensive demonstration records for BCA viva
│   └── initDb.js                 # Automated database creation and seeder runner
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Badge, Modal, StatCard, Alert, LoadingSpinner, ProtectedRoute
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state, session persistence, role routing
│   │   ├── layouts/
│   │   │   ├── Navbar.jsx        # Responsive navigation with role shortcuts & quick profile
│   │   │   ├── Footer.jsx        # Clinic contact info & academic project disclaimer
│   │   │   └── DashboardLayout.jsx # Role-specific sidebar navigation & page shell
│   │   ├── pages/
│   │   │   ├── public/           # HomePage, AboutPage, DoctorDirectoryPage, LoginPage, RegisterPage
│   │   │   ├── patient/          # PatientDashboard, BookAppointmentPage, MyAppointmentsPage, QueueStatusPage, PatientProfilePage
│   │   │   ├── doctor/           # DoctorDashboard, DoctorQueuePage, DoctorAppointmentsPage, DoctorSchedulePage, DoctorProfilePage
│   │   │   └── admin/            # AdminDashboard, ManageDoctorsPage, ManagePatientsPage, ManageAppointmentsPage, ClinicSettingsPage
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT auto-injection & interceptors
│   │   ├── styles/
│   │   │   └── index.css         # Healthcare design system (White, Sapphire, Teal)
│   │   ├── App.jsx               # React Router v6 route configuration with role guards
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 2. Technology Stack

- **Frontend**: React.js 18 (JavaScript), React Router DOM v6, Axios, Lucide React Icons, Modular CSS3.
- **Backend**: Node.js, Express.js (RESTful APIs), JWT (`jsonwebtoken`), `bcryptjs`, CORS.
- **Database**: MySQL Server (`mysql2/promise` with connection pooling and transactions).
- **Build & Dev Tooling**: Vite for fast frontend HMR and production bundling.

---

## 3. Database Design (MySQL)

The system uses 7 relational tables with strict referential integrity and indexes:

1. **`users`**: Central authentication table for all roles (`patient`, `doctor`, `admin`) with unique email, bcrypt hash, and account status (`active`, `inactive`, `suspended`).
2. **`clinics`**: Multi-clinic ready facility entity with operating hours and contact details.
3. **`doctors`**: Doctor professional profile linked to `users(id)` and `clinics(id)`, storing specialization, qualification, fee, room number, and availability.
4. **`patients`**: Patient demographics linked to `users(id)`, storing DOB, gender, blood group, emergency contact, and medical history.
5. **`doctor_schedules`**: Weekly recurring shifts by `day_of_week` with `start_time`, `end_time`, `slot_duration_minutes`, and active flags.
6. **`appointments`**: Core appointment records with unique reference `MQ-YYYYMMDD-XXXX`, patient, doctor, clinic, date, time, and status (`Booked`, `Confirmed`, `Waiting`, `In Consultation`, `Completed`, `Cancelled`).
7. **`queues`**: Sequential queue tokens per doctor and date with status progression (`Waiting` -> `In Consultation` -> `Completed` / `Cancelled`).

---

## 4. Installation & Step-by-Step Setup Guide

### Prerequisites
- **Node.js** (v18 or higher installed)
- **npm** (v9 or higher installed)
- **MySQL Server** (e.g., via XAMPP Control Panel, MySQL Community Server, or MariaDB)

---

### Step 1: Start MySQL Server
Ensure MySQL is running on your machine:
- If using **XAMPP**: Open **XAMPP Control Panel** and click **Start** next to **MySQL**.
- Default MySQL credentials in XAMPP: Host: `localhost`, Port: `3306`, User: `root`, Password: *(blank)*.

---

### Step 2: Configure Backend Environment Variables
A sample `.env` file is located at `backend/.env`. You can verify or edit your MySQL connection settings:
```env
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mediqueue_db

# Security & JWT Token Key
JWT_SECRET=mediqueue_super_secret_jwt_key_2026_bca_academic_project
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

---

### Step 3: Initialize Database & Insert Demo Records
Run the automated database setup script from the project root:
```bash
# Option A: From backend folder
cd backend
npm run db:init

# Option B: Directly with Node
node database/initDb.js
```
*Alternatively, you can import `database/schema.sql` followed by `database/seed.sql` inside **phpMyAdmin** or **MySQL Workbench**.*

---

### Step 4: Install Dependencies & Start the Backend API
In your terminal, navigate to the `backend` directory:
```bash
cd backend
npm install
npm run dev
```
The backend server will start on: **`http://localhost:5000`**  
Health Check endpoint: **`http://localhost:5000/api/health`**

---

### Step 5: Install Dependencies & Start the Frontend
In a **new terminal tab/window**, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The React frontend will start on: **`http://localhost:5173`**  
Open your browser and navigate to **`http://localhost:5173`**.

---

## 5. Pre-Seeded Demonstration Accounts (For BCA Evaluation)

All demonstration accounts are protected by a strong, memorable credentials policy.  
*(The Login page provides 1-click Quick Email Selection buttons for effortless evaluator convenience; passwords are typed manually to maintain authentic security standards).*

| Role | Account Name | Login Email | Password Mode | Details |
|---|---|---|---|---|
| **Administrator** | System Administrator | `admin@mediqueue.com` | Enter manually | Full control over doctors, patients, appointments, and clinic settings |
| **Doctor** | Dr. Sarah Jenkins | `dr.sarah@mediqueue.com` | Enter manually | Cardiology Specialist (Room 201) |
| **Doctor** | Dr. Rajesh Sharma | `dr.rajesh@mediqueue.com` | Enter manually | General Medicine Specialist (Room 102) |
| **Doctor** | Dr. Priya Patel | `dr.priya@mediqueue.com` | Enter manually | Pediatrics Specialist (Room 105) |
| **Patient** | John Doe | `john.doe@example.com` | Enter manually | Pre-booked appointment with Queue Token #1 |
| **Patient** | Jane Smith | `jane.smith@example.com` | Enter manually | Pre-booked appointment with Queue Token #2 |

---

## 6. End-to-End Demonstration Workflows

### Workflow 1: Patient Discovery & Booking
1. Browse to **Find Doctors** (`/doctors`) to search and filter doctors by specialization.
2. Click **Book Slot** on Dr. Sarah Jenkins.
3. Select an appointment date. The system contacts the backend slot engine and renders available time slots in teal, with already booked slots struck through.
4. Pick a slot (e.g. `10:30 AM`), enter reason for visit, and submit.
5. The system performs an atomic database transaction with `FOR UPDATE` locking, generates a unique reference code (`MQ-YYYYMMDD-XXXX`), and assigns the next sequential queue token for that doctor today.
6. The patient receives an instant confirmation popover with direct links to **My Appointments** and **Live Queue Tracker**.

### Workflow 2: Patient Real-Time Queue Tracker
1. Go to **Live Queue Status** (`/patient/queue`).
2. Displays the patient's big Queue Token number.
3. Displays **Currently Serving Token #** and **Patients Ahead in Line**.
4. Shows clear, transparent room guidance (e.g., *"You are next in line! Please proceed near Room 201"*).

### Workflow 3: Doctor Live Queue Cockpit
1. Sign in as `dr.sarah@mediqueue.com`.
2. Go to **Live Queue Cockpit** (`/doctor/queue`).
3. Click the **Call Next Patient** button.
4. The system automatically marks any active consultation as `Completed`, advances the next waiting patient to `In Consultation`, stamps `called_at`, and updates the database records in tandem.
5. Add clinical remarks/prescriptions and mark consultation as completed.

### Workflow 4: Administrator Management Console
1. Sign in as `admin@mediqueue.com`.
2. View real-time KPI metric cards (Total Patients, Total Doctors, Total Appointments, Today's Waiting Count).
3. In **Manage Doctors**, click **Add New Doctor** to register a new physician; the system auto-creates their user account and initializes default Monday-Friday consultation schedules.
4. In **Clinic Settings**, update clinic name, phone, address, and operating hours.

---

## 7. Automated Test Suite Results

MediQueue includes two comprehensive automated test suites covering unit logic and HTTP route security:
```bash
cd backend
npm test
```

### Actual Test Execution Output:
```
======================================================
   MediQueue Full-Stack Test Suite
======================================================

--- [1] Unique Reference Generator ---
  ✅ PASS: Generates standard MQ reference matching MQ-YYYYMMDD-XXXX
  ✅ PASS: Generates unique references without immediate collisions

--- [2] Slot Calculation & Conflict Engine ---
  ✅ PASS: Generates correct slot sequence for a 09:00 - 11:00 shift (30 min duration)
  ✅ PASS: Marks booked slot as unavailable and preserves other slots
  ✅ PASS: Rejects past slots when target date is today

--- [3] Form Validation Middleware ---
  ✅ PASS: Validates valid emails and rejects invalid formats
  ✅ PASS: Validates standard date format YYYY-MM-DD
  ✅ PASS: Rejects past appointment date in booking validation middleware
  ✅ PASS: Rejects schedule where start_time is greater than or equal to end_time

--- [4] Authentication & RBAC Security ---
  ✅ PASS: Signs and decodes valid JWT for patient
  ✅ PASS: Rejects missing authorization header with 401
  ✅ PASS: Prevents patient from accessing doctor or admin-only routes (403 Forbidden)
  ✅ PASS: Allows authorized roles through role guard

--- [5] Queue Numbering & State Progression ---
  ✅ PASS: Queue numbers increment sequentially per doctor per date
  ✅ PASS: Simulates Call Next Patient: transitions previous to Completed and next to In Consultation
  ✅ PASS: Cancelled appointment is excluded from active waiting count

--- [6] Duplicate Booking Prevention Simulation ---
  ✅ PASS: Detects slot collision and denies double-booking for same doctor, date, and slot

======================================================
📊 Test Results: 17 Passed, 0 Failed.
======================================================

--- [7] Express HTTP In-Memory Route Tests ---
  ✅ PASS: GET /api/health responds with 200 and status: ONLINE
  ✅ PASS: POST /api/auth/register rejects incomplete input with 400 Bad Request
  ✅ PASS: POST /api/auth/login rejects malformed payload with 400 Bad Request
  ✅ PASS: GET /api/appointments rejects unauthenticated requests with 401 Unauthorized
  ✅ PASS: GET /api/admin/stats rejects unauthenticated requests with 401 Unauthorized
  ✅ PASS: GET /api/queue/patient/live rejects unauthenticated requests with 401 Unauthorized
  ✅ PASS: Undefined routes return 404 JSON error response

======================================================
🎉 Express In-Memory Integration Tests: 7/7 Passed Cleanly!
======================================================
```
**Total Verified Tests: 24 Passed, 0 Failed.**

---

## 8. Academic Evaluation Summary (BCA Final Year)

| Evaluation Parameter | MediQueue Implementation |
|---|---|
| **Software Architecture** | Clean 3-tier architecture: Presentation (React SPA), Business Logic (Express REST API), Data Tier (MySQL). |
| **Database Integrity** | Relational DDL with Primary Keys, Foreign Keys (`ON DELETE CASCADE`/`RESTRICT`), Unique constraints, and ACID transactions. |
| **Security Standards** | bcrypt password hashing with salt rounds, JWT bearer tokens, role-based route middleware, SQL injection prevention. |
| **Concurrency Handling** | Slot checking with `FOR UPDATE` row locks inside transaction guarantees zero double-booking even under concurrent clicks. |
| **User Experience** | White & sapphire healthcare theme, responsive layout, clear error alerts, empty states, and 1-click viva credentials. |

---

*Developed for the Final Year Bachelor of Computer Applications (BCA) Project Evaluation.*

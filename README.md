# Healthcare Platform (Practo Clone)

A full-stack healthcare platform built with React, Node.js/Express, and Supabase.

## Project Structure

```
Healthcare/
├── frontend/        # React + Vite application
├── backend/         # Node.js + Express API
├── README.md
└── .gitignore
```

## Tech Stack

**Frontend:** React, Vite, TailwindCSS, React Router DOM, Axios, Framer Motion, React Hot Toast

**Backend:** Node.js, Express, Supabase JS

**Database/Auth:** Supabase (PostgreSQL + Auth + Storage)

## Getting Started

### Prerequisites
- Node.js >= 18
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Clone and install dependencies

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment variables

**backend/.env**
```
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the application

```bash
# Terminal 1 - Start backend
cd backend && npm run dev

# Terminal 2 - Start frontend
cd frontend && npm run dev
```

Frontend runs at: `http://localhost:5173`
Backend runs at: `http://localhost:5000`

## Supabase Database Schema

Run the following SQL in your Supabase SQL editor to create the schema:

```sql
-- See backend/config/schema.sql for full schema
```

## Features

### Patient
- Search doctors by name/specialization/location
- View doctor profiles and reviews
- Book, view, and cancel appointments
- Patient dashboard with appointment history

### Doctor
- Dashboard with upcoming appointments
- Manage availability slots
- View and update profile

### Admin
- Manage all doctors, patients, appointments
- Platform analytics overview

## Roles
- `patient` (default)
- `doctor`
- `admin`

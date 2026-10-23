# SurakshaOps
### Coal Mine Productivity & Safety Management System

SurakshaOps is a web-based application designed to support coal mine operations by organizing safety management, shift handovers, incident reporting, and operational records in one place.

Developed as an academic project.

## Features

- **Dashboard** — Overview of mine safety and operational activities.
- **Shift Handover** — Record and review information between shifts.
- **Safety Management Plan (SMP)** — Organize safety plans and hazard-related records.
- **Incident Management** — Maintain records of safety incidents.
- **Logbooks** — Maintain operational logs.
- **Employee Management** — Manage employee records.
- **Equipment Management** — Maintain equipment information.
- **Reports** — View and generate reports.
- **Authentication** — Email and password registration and login.
- **Role Management** — User profiles with assigned roles.
- **Cloud Database** — Supabase-backed storage for application records.
- **ERP Module** — Placeholder for future enterprise resource planning integration.

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- TanStack React Start
- Supabase Authentication
- Supabase PostgreSQL
- Cloudflare Workers

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project


Follow these steps to set up SurakshaOps on your local computer.

### 1. Clone the Repository

```bash
git clone https://github.com/SARTHAKx07/surakshaops.git
cd surakshaops
```

### 2. Install Dependencies

Make sure Node.js and npm are installed, then run:

```bash
npm install
```

This installs the dependencies required by the project.

### 3. Configure Environment Variables

Create a file named `.env.local` in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with the corresponding values from your Supabase project.

**Security:** Never upload `.env.local` or private credentials to GitHub.

### 4. Configure the Database

1. Open your Supabase project.
2. Navigate to the SQL Editor.
3. Run the SQL migration files located in `supabase/migrations/` in chronological order.
4. Confirm that the required tables, authentication triggers, and policies are configured.

### 5. Start the Development Server

Run:

```bash
npm run dev
```

Open the local URL displayed in the terminal to access the application.

### 6. Build the Application

To create a production build, run:

```bash
npm run build
```

### 7. Access the Live Demo

**Live Application:** https://tanstack-start-ts.surakshaops.workers.dev

## Project Status

SurakshaOps is an academic project designed to support coal mine productivity and safety management. Some modules may require further development and testing.

The ERP module is currently a placeholder for future integration. This project is not a certified mine-safety system and does not replace official safety procedures.


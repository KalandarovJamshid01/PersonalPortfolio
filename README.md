# Softy Software Website

A responsive corporate website built with React, TypeScript, and MySQL.

## Prerequisites

- Node.js (v18 or newer)
- MySQL database (v8.0 or newer)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure MySQL database:
   - Create a `.env` file in the root directory using `.env.sample` as a template
   - Set your MySQL connection details in the `DATABASE_URL` variable, e.g.:
     ```
     DATABASE_URL=mysql://username:password@localhost:3306/softy_db
     ```

4. Set up the database:
   ```bash
   node scripts/setup-mysql.js
   ```
   This will:
   - Create the database if it doesn't exist
   - Create all required tables
   - Add initial content and admin user

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   - Main site: http://localhost:5000
   - Admin panel: http://localhost:5000/admin/login

## Admin Access

Use these credentials to access the admin panel:
- Username: `admin`
- Password: `admin123`

## Features

- Responsive design optimized for all devices
- Contact form with server-side validation
- Admin panel with:
  - Contact messages management
  - Content editing
  - Page view statistics

## Project Structure

- `/client` - Frontend code (React, TypeScript, Tailwind CSS)
- `/server` - Backend API (Express)
- `/shared` - Shared code between frontend and backend
- `/scripts` - Utility scripts

## Database Structure

The application uses the following database tables:
- `contacts` - Contact form submissions
- `content` - Website content by section
- `page_views` - Page view statistics
- `users` - Admin user accounts

## Development

- The application uses MySQL for data storage
- Drizzle ORM is used for database interactions
- TanStack Query handles data fetching on the frontend"# PersonalPortfolio" 

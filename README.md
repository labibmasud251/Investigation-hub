# Investigation Hub

A platform for managing investigation requests and reports, connecting clients with investigators.

## Features

- User authentication (JWT-based)
- Role-based access control (Clients and Investigators)
- Investigation request management
- Report submission and rating system
- Profile management

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd investigation-hub
```

2. Install dependencies:
```bash
npm install
```

3. Create a MySQL database:
```bash
mysql -u root -p
CREATE DATABASE investigation_hub;
```

4. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the database credentials and JWT secret

5. Run database migrations:
```bash
npm run migrate
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Users
- GET /api/users/profile - Get user profile
- PATCH /api/users/profile - Update user profile
- GET /api/users/investigators/:id - Get investigator profile with ratings

### Investigations
- GET /api/investigations - Get all investigation requests
- POST /api/investigations - Create new investigation request
- PATCH /api/investigations/:id/accept - Accept investigation request
- PATCH /api/investigations/:id/complete - Complete investigation request

### Reports
- POST /api/reports/:investigationId - Submit investigation report
- POST /api/reports/:investigationId/rate - Rate investigation report
- GET /api/reports/:investigationId - Get investigation report

## Database Migrations

Run migrations:
```bash
npm run migrate
```

Rollback migrations:
```bash
npm run migrate:rollback
```

## License

ISC 
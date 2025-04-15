# Investigation Hub Frontend

A React-based frontend application for the Investigation Hub platform. This application allows clients to submit investigation requests and investigators to accept and manage these investigations.

## Features

- User authentication (Register/Login)
- Role-based access control (Client/Investigator)
- Dashboard for managing investigations
- Investigation submission and management
- Report submission
- Investigator rating system
- User profiles

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Investigation Hub Backend API running

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd investigation-hub-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following configuration:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context for state management
├── pages/         # Page components
├── services/      # API service functions
└── utils/         # Utility functions
```

## Available Scripts

- `npm start` - Starts the development server
- `npm test` - Runs the test suite
- `npm run build` - Creates a production build
- `npm run eject` - Ejects from Create React App

This project is licensed under the MIT License - see the LICENSE file for details. 

# Time Tracker App

A modern web and mobile application for employee time tracking.

## Features

- Employee clock in/out with break tracking
- Manager dashboard for monitoring time entries
- Email invitation system for new employees
- Mobile-responsive web interface
- API ready for mobile app integration

## Tech Stack

- Frontend: React with Material-UI
- Backend: Node.js with Express
- Database: PostgreSQL with Sequelize ORM
- Authentication: JWT

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone this repository
git clone https://github.com/ayoubhabou/time-tracker-app.git
cd time-tracker-app

2. Install backend dependencies
cd backend
npm install


3. Install frontend dependencies
cd ../frontend-web
npm install

4. Create a `.env` file in the backend directory with your configuration:
DB_NAME=timetracker
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password

5. Start the development servers
In the backend directory
npm start
In the frontend-web directory (in another terminal)
npm start


## Production Deployment

Use the provided scripts for production deployment:
Build production version
./build-prod.sh
Start production server
./start-prod.sh
Copy
## API Documentation

See [API_DOCS.md](backend/API_DOCS.md) for details on the API endpoints for mobile integration.

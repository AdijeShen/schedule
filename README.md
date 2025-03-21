# Task Planner

A comprehensive task management and time planning application that helps users organize tasks using the Eisenhower Matrix method and manage time blocks effectively.

## Features

- **Task Management**
  - Create, edit, and delete tasks
  - Categorize tasks using the Eisenhower Matrix (Urgent/Important quadrants)
  - Set start time and due date for tasks
  - Import/Export tasks via CSV

- **Time Block Management**
  - Visual time block grid for daily planning
  - Color-coded time blocks for status tracking
  - Daily summary with rating and reflection
  - Add notes to time blocks

- **Reminder System**
  - Set reminders for important events
  - Desktop notifications
  - Custom repeat intervals

- **Multiple Views**
  - Task List View
  - Calendar View
  - Quadrant View (Eisenhower Matrix)
  - Time Block View
  - Reminder View

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- Day.js for date handling
- Vite as build tool

### Backend
- Node.js
- Express.js
- SQLite database
- Sequelize ORM
- JWT Authentication

## Installation

1. Clone the repository

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm start
```
The server will run on http://localhost:3001

2. Start the frontend development server:
```bash
cd ..
npm run dev
```
The application will be available at http://localhost:3000

## Database Management

The application uses SQLite with Sequelize ORM. The database structure is not automatically synchronized on server start to avoid data loss.

To manage the database:

1. **Sync database structure** (safe update preserving data where possible):
```bash
cd server
npm run db:sync
```

2. **Reset database** (CAUTION: will delete all data):
```bash
cd server
npm run db:reset
```

For more details, see the [Database Management Guide](server/DATABASE.md).

## Deployment

This application can be deployed to various platforms including Firebase, Vercel, or traditional hosting.

For detailed deployment instructions, see the [Deployment Guide](DEPLOYMENT.md).

## Usage

### Task Management

1. **Creating a Task**
   - Click the + button in the task list
   - Fill in the task details:
     - Title (required)
     - Description (optional)
     - Task Type (based on urgency and importance)
     - Start Time
     - Due Date

2. **Editing a Task**
   - Click the edit icon on any task
   - Modify the task details
   - Save changes

### Time Block Management

1. **Viewing Time Blocks**
   - Navigate to the Time Block view
   - Select a date to view its time blocks

2. **Managing Time Blocks**
   - Click on a time block to change its status
   - Right-click to add notes
   - Add daily summaries and ratings

### Reminder System

1. **Creating Reminders**
   - Navigate to Reminder view
   - Click the + button to add a new reminder
   - Set title, date, time, and repeat interval

2. **Managing Notifications**
   - Allow browser notifications when prompted
   - Receive alerts even when the app is in background

## Project Structure

```
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── services/         # API and utility services
│   └── utils/            # Utility functions
├── server/               # Backend source code
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── scripts/      # Utility scripts
│   └── database.sqlite   # SQLite database file
├── public/               # Static assets
└── vite.config.js        # Vite configuration
```

## Environment Configuration

The application uses environment variables for configuration:

- `.env` - Development environment settings
- `.env.production` - Production environment settings

## License

MIT License
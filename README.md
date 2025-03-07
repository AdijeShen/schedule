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
  - Assign tasks to specific time blocks
  - Track time block status
  - Add notes to time blocks

- **Multiple Views**
  - Task List View
  - Calendar View
  - Quadrant View (Eisenhower Matrix)
  - Time Block View

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

## Installation

1. Clone the repository

2. Install frontend dependencies:
```bash
cd schedule
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
The application will be available at http://localhost:5173

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

3. **Deleting a Task**
   - Click the delete icon on any task
   - Confirm deletion

4. **Importing/Exporting Tasks**
   - Use the Import button to upload a CSV file
   - Use the Export button to download tasks as CSV

### Time Block Management

1. **Viewing Time Blocks**
   - Navigate to the Time Block view
   - Select a date to view its time blocks

2. **Managing Time Blocks**
   - Click on a time block to edit
   - Add notes or change status
   - Associate tasks with time blocks

## Project Structure

```
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── pages/           # Page components
│   └── services/        # API and utility services
├── server/              # Backend source code
│   ├── src/
│   │   ├── config/     # Database configuration
│   │   ├── models/     # Sequelize models
│   │   └── routes/     # API routes
│   └── database.sqlite  # SQLite database file
└── vite.config.js       # Vite configuration
```

## License

MIT License
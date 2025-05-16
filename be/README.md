# HabitVault Backend

The backend server for HabitVault, a minimalist habit tracking application that helps users build consistent routines through daily tracking, streaks, and visual analytics.

## Overview

HabitVault's backend provides a secure API for managing habits, logging daily completions, tracking streaks, and generating statistics. It follows REST principles and uses JWT authentication to ensure data security.

## Features

- User authentication (register/login)
- Habit management (create, read, update, delete)
- Daily habit logging system
- Automatic streak calculation
- Analytics and statistics generation
- User preferences storage
- Daily motivational quotes

## Tech Stack

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/HabitVault.git
cd HabitVault/be
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgres://username:password@localhost:5432/habitvault
FRONTEND_URL=http://localhost:3000
```

4. Start the development server
```bash
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in a user |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/logout` | Log out a user |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits for logged-in user |
| POST | `/api/habits` | Create a new habit |
| GET | `/api/habits/:id` | Get a specific habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| GET | `/api/habits/:id/logs` | Get logs for a specific habit |
| POST | `/api/habits/:id/logs` | Log habit completion or missed status |
| PUT | `/api/habits/:habitId/logs/:date` | Update a specific log |
| GET | `/api/habits/stats/summary` | Get habit analytics and statistics |

### User Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile with preferences |
| GET | `/api/user/preferences` | Get user preferences |
| PUT | `/api/user/preferences` | Update user preferences |

### Quotes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotes/daily` | Get a daily motivational quote |
| GET | `/api/quotes/random` | Get a random motivational quote |
| GET | `/api/quotes` | Get all motivational quotes |

## Example API Requests & Responses

### Create a New Habit

**Request:**
```http
POST /api/habits
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "name": "Morning Meditation",
  "description": "15 minutes of mindfulness practice",
  "frequency": "daily",
  "targetDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "habit": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Morning Meditation",
    "description": "15 minutes of mindfulness practice",
    "targetDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    "frequency": "daily",
    "currentStreak": 0,
    "longestStreak": 0,
    "startDate": "2023-04-15T10:30:00.000Z",
    "isActive": true,
    "userId": "098f6bcd-4621-3373-8ade-4e832627b4f6",
    "createdAt": "2023-04-15T10:30:00.000Z",
    "updatedAt": "2023-04-15T10:30:00.000Z"
  },
  "message": "Habit created successfully"
}
```

### Log Habit Completion

**Request:**
```http
POST /api/habits/123e4567-e89b-12d3-a456-426614174000/logs
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "date": "2023-04-15",
  "status": "completed",
  "notes": "Felt very focused today"
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "id": "7e9d5eb7-9a1c-4f2c-8d53-626a4e10ae6b",
    "habitId": "123e4567-e89b-12d3-a456-426614174000",
    "date": "2023-04-15",
    "status": "completed",
    "notes": "Felt very focused today",
    "createdAt": "2023-04-15T18:25:32.511Z",
    "updatedAt": "2023-04-15T18:25:32.511Z"
  },
  "message": "Habit completed for 2023-04-15"
}
```

### Get Habit Statistics

**Request:**
```http
GET /api/habits/stats/summary
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalHabits": 5,
    "activeHabits": 4,
    "overallCompletionRate": 78.5,
    "bestHabit": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Morning Meditation",
      "currentStreak": 7,
      "longestStreak": 15,
      "completionRate": 92.3
    },
    "habitStats": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Morning Meditation",
        "currentStreak": 7,
        "longestStreak": 15,
        "completionRate": 92.3
      },
      {
        "id": "456e7890-e89b-12d3-a456-426614174000",
        "name": "Daily Exercise",
        "currentStreak": 3,
        "longestStreak": 10,
        "completionRate": 85.7
      }
    ]
  }
}
```

### Get Daily Quote

**Request:**
```http
GET /api/quotes/daily
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "text": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "author": "Aristotle"
  }
}
```

## Database Models

### User
- id (UUID, primary key)
- email (String, unique)
- password (String, hashed)
- name (String)
- createdAt (Date)
- updatedAt (Date)

### Habit
- id (UUID, primary key)
- userId (UUID, foreign key)
- name (String)
- description (Text)
- targetDays (JSON array)
- frequency (String)
- currentStreak (Integer)
- longestStreak (Integer)
- startDate (Date)
- isActive (Boolean)
- createdAt (Date)
- updatedAt (Date)

### HabitLog
- id (UUID, primary key)
- habitId (UUID, foreign key)
- date (Date)
- status (Enum: 'completed', 'missed', 'skipped')
- notes (Text)
- createdAt (Date)
- updatedAt (Date)

### UserPreference
- id (UUID, primary key)
- userId (UUID, foreign key, unique)
- darkMode (Boolean)
- analyticsTimeRange (Enum: 'week', 'month', 'year')
- showMotivationalQuotes (Boolean)
- notificationsEnabled (Boolean)
- createdAt (Date)
- updatedAt (Date)

## Error Handling

All API endpoints return a standard error format:

```json
{
  "success": false,
  "message": "Error message explaining what went wrong"
}
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Authentication

The API uses JWT for authentication. Most endpoints require an Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained during login and should be included in all subsequent requests. 
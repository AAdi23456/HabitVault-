# HabitVault Backend

The backend API service for HabitVault, a habit tracking application that helps users build better habits and track their progress.

## Technology Stack

- **Node.js & Express**: Core server framework
- **MongoDB**: Primary database for storing user and habit data
- **JWT Authentication**: Secure user authentication using HTTP-only cookies
- **RESTful API**: Organized endpoints for habit management

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/login` | Authenticate user and create session |
| POST | `/api/auth/logout` | End user session |
| GET | `/api/auth/me` | Get current authenticated user data |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits for authenticated user |
| GET | `/api/habits/:id` | Get a specific habit |
| POST | `/api/habits` | Create a new habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |

### Habit Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/habits/:id/complete` | Mark a habit as completed for today |
| DELETE | `/api/habits/:id/complete` | Remove completion mark for today |
| GET | `/api/habits/stats` | Get statistics for all habits |
| GET | `/api/habits/:id/stats` | Get statistics for a specific habit |

## Data Models

### User

```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Habit

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  frequency: {
    type: String, // daily, weekly, etc.
    days: [Number], // days of week (for weekly habits)
    times: Number // number of times per period
  },
  timeOfDay: String, // morning, afternoon, evening
  duration: Number, // in minutes
  createdAt: Date,
  updatedAt: Date
}
```

### Completion

```javascript
{
  _id: ObjectId,
  habitId: ObjectId,
  userId: ObjectId,
  date: Date,
  completed: Boolean,
  note: String
}
```

## Security Features

- Password hashing using bcrypt
- JWT authentication with HTTP-only cookies
- CORS protection
- Rate limiting for API endpoints
- Input validation and sanitization

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/habitvault.git
cd habitvault-be
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habitvault
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. **Start the development server**

```bash
npm run dev
```

5. **Build for production**

```bash
npm run build
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"
```

## API Documentation

Full API documentation is available at `/api-docs` when running the server in development mode.

## License

MIT 
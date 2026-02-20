# Expert Session Booking System - Backend

Node.js + Express + MongoDB backend for real-time expert session booking.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expert-booking
NODE_ENV=development
```

### Running the Application

1. Make sure MongoDB is running

2. Seed the database with sample experts:
```bash
node seed.js
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on http://localhost:5000

## API Endpoints

### Experts
- `GET /api/experts` - Get all experts (with pagination, search, filter)
- `GET /api/experts/:id` - Get expert by ID
- `GET /api/experts/categories` - Get all categories

### Bookings
- `POST /api/bookings` - Create a booking
- `GET /api/bookings?email=` - Get bookings by email
- `PATCH /api/bookings/:id/status` - Update booking status

## Features

- ✅ Proper folder structure (models/routes/controllers)
- ✅ MongoDB with Mongoose
- ✅ Socket.io for real-time updates
- ✅ Transaction support to prevent double booking
- ✅ Validation using express-validator
- ✅ Environment variables
- ✅ Error handling

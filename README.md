# Expert Session Booking System

A full-stack web application for managing expert consultation bookings with real-time synchronization.

## Technology Stack

- **Frontend:** React 18, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-time:** Socket.io

## Architecture

```
BC05/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Entry point
│   └── seed.js          # Database seeding
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # State management
    │   ├── services/    # API & Socket.io
    │   └── App.js
    └── package.json
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure MongoDB URI in .env
node seed.js
npm start
```

Server runs on `http://localhost:9066`

### Frontend

```bash
cd frontend
npm install
npm start
```

Application runs on `http://localhost:3000`

## API Endpoints

**Experts**
- `GET /api/experts/v1` - List experts with pagination, search, and filtering
- `GET /api/experts/:id/v1` - Retrieve expert details

**Bookings**
- `POST /api/bookings/v1` - Create new booking
- `GET /api/bookings/v1?email=` - Retrieve user bookings
- `PATCH /api/bookings/:id/status/v1` - Update booking status

## Database Schema

**Expert**
```
name, category, experience, rating, bio, email, imageUrl
availability: [{ date, slots: [{ time, isBooked }] }]
```

**Booking**
```
expertId (ref), name, email, phone, date, timeSlot, notes
status: Pending | Confirmed | Completed
```

## Technical Implementation

**Concurrency Control**
- Unique compound index on `expertId`, `date`, and `timeSlot`
- Application-level validation before database writes

**Real-time Updates**
- Socket.io events: `slotBooked`, `bookingStatusUpdated`
- Automatic client synchronization

**Validation**
- Server-side validation using express-validator
- Client-side form validation

## License

MIT

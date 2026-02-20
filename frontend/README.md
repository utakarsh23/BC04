# Frontend - Expert Session Booking System

React application for the expert booking platform.

## Requirements

- Node.js v14+
- Backend server running on port 9066

## Installation

```bash
cd frontend
npm install
```

## Configuration

Update `.env` if backend URL differs:
```
REACT_APP_API_URL=http://localhost:9066/api
REACT_APP_SOCKET_URL=http://localhost:9066
```

## Development

```bash
npm start
```

Runs on `http://localhost:3000`

## Structure

```
src/
├── components/       # UI components
├── context/          # React Context providers
├── services/         # API and Socket.io clients
└── App.js           # Main application
```

## Core Components

- **ExpertListing** - Browse and filter experts
- **ExpertDetail** - View expert profile and availability
- **BookingForm** - Create new bookings
- **MyBookings** - Manage user bookings

## Technical Stack

- React 18
- React Router
- Tailwind CSS
- Socket.io Client
- Axios

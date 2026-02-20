const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const expertRoutes = require('./routes/expertRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const connectMongoDB = require('./db/db');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH']
  }
});


app.use(cors({ origin: process.env.CLIENT_URL, methods: ['GET', 'POST', 'PATCH'] }));

app.use(express.json());
console.log(process.env.MONGODB_URI);

connectMongoDB(process.env.MONGODB_URI);

app.set('io', io);


app.use('/api/experts', expertRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 9066;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

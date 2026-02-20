const mongoose = require('mongoose');   
const dotenv = require('dotenv');
dotenv.config();

async function connectMongoDB(mongoURI) {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectMongoDB;
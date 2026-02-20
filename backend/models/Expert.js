const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  slots: [{
    time: {
      type: String,
      required: true
    },
    isBooked: {
      type: Boolean,
      default: false
    }
  }]
});

const reviewSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const expertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  bio: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  availability: [timeSlotSchema],
  reviews: [reviewSchema]
}, {
  timestamps: true
});

expertSchema.index({ name: 'text' });

const Expert = mongoose.model('Expert', expertSchema);

module.exports = Expert;

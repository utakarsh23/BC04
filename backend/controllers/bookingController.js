const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { validationResult } = require('express-validator');


async function createBooking(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { expertId, name, email, phone, date, timeSlot, notes } = req.body;
    if(!expertId || !name || !email || !phone || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expert = await Expert.findById(expertId);
      
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    const dateAvailability = expert.availability.find(a => a.date === date);
    if (!dateAvailability) {
      return res.status(400).json({ error: 'Expert not available on this date' });
    }

    const slot = dateAvailability.slots.find(s => s.time === timeSlot);
    if (!slot || slot.isBooked) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    const existingBooking = await Booking.findOne({ expertId, date, timeSlot });

    if (existingBooking) {
      return res.status(400).json({ error: 'This slot is already booked' });
    }

    slot.isBooked = true;
    await expert.save();

    const booking = await Booking.create({
      expertId,
      name,
      email,
      phone,
      date,
      timeSlot,
      notes
    });


    const populatedBooking = await Booking.findById(booking._id).populate('expertId', 'name category');

    const io = req.app.get('io');
    io.emit('slotBooked', {
      expertId,
      date,
      timeSlot
    });

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', message: error.message });
  }
};

async function getBookings(req, res) {
  try {
    const { email } = req.query;
    

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const bookings = await Booking.find({ email })
      .populate('expertId', 'name category experience rating')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
  }
};

async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('expertId', 'name category');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const io = req.app.get('io');
    io.emit('bookingStatusUpdated', booking);

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', message: error.message });
  }
};

async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { phone, notes, timeSlot } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If timeSlot is being updated
    if (timeSlot && timeSlot !== booking.timeSlot) {
      const expert = await Expert.findById(booking.expertId);
      if (!expert) {
        return res.status(404).json({ error: 'Expert not found' });
      }

      const dateAvailability = expert.availability.find(a => a.date === booking.date);
      if (!dateAvailability) {
        return res.status(400).json({ error: 'Expert not available on this date' });
      }

      // Check if new slot is available
      const newSlot = dateAvailability.slots.find(s => s.time === timeSlot);
      if (!newSlot || newSlot.isBooked) {
        return res.status(400).json({ error: 'New time slot not available' });
      }

      // Free up old slot
      const oldSlot = dateAvailability.slots.find(s => s.time === booking.timeSlot);
      if (oldSlot) {
        oldSlot.isBooked = false;
      }

      // Book new slot
      newSlot.isBooked = true;
      await expert.save();

      // Update booking
      booking.timeSlot = timeSlot;

      // Emit socket event for slot change
      const io = req.app.get('io');
      io.emit('slotBooked', {
        expertId: booking.expertId,
        date: booking.date,
        timeSlot: timeSlot
      });
    }

    // Update other fields
    if (phone !== undefined) booking.phone = phone;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    const updatedBooking = await Booking.findById(id).populate('expertId', 'name category');
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', message: error.message });
  }
};


module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
  updateBooking
};
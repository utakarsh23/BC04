const Expert = require('../models/Expert');

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push({
      time: `${hour}:00`,
      isBooked: false
    });
  }
  return slots;
};


const generateFreshAvailability = (existingAvailability = []) => {
  const availability = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  

  for (let i = 2; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Check if this date exists in existing availability
    const existingDate = existingAvailability.find(a => a.date === dateString);
    
    if (existingDate) {
      availability.push(existingDate);
    } else {
      availability.push({
        date: dateString,
        slots: generateTimeSlots()
      });
    }
  }
  
  return availability;
};

async function getExperts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    const experts = await Expert.find(query)
      .select('-availability')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    const total = await Expert.countDocuments(query);

    res.json({
      experts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experts', message: error.message });
  }
};

async function getExpertById(req, res) {
  try {
    const expert = await Expert.findById(req.params.id);
    
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    const freshAvailability = generateFreshAvailability(expert?.availability);
    
    expert.availability = freshAvailability;
    await expert.save();

    res.json(expert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expert', message: error.message });
  }
};

async function getCategories(req, res) {
  try {
    const categories = await Expert.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories', message: error.message });
  }
};

module.exports = {
  getExperts,
  getExpertById,
  getCategories
};

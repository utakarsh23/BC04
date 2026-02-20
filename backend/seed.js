const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expert = require('./models/Expert');

dotenv.config();

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

const generateAvailability = () => {
  const availability = [];
  const today = new Date();
  
  // Start from tomorrow (i = 1) instead of today
  for (let i = 2; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    availability.push({
      date: date.toISOString().split('T')[0],
      slots: generateTimeSlots()
    });
  }
  
  return availability;
};

const experts = [
  {
    name: 'Dr. Sarah Johnson',
    category: 'Technology',
    experience: 12,
    rating: 4.8,
    bio: 'Senior software architect specializing in cloud solutions and microservices',
    email: 'sarah.johnson@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    availability: generateAvailability()
  },
  {
    name: 'Michael Chen',
    category: 'Business',
    experience: 8,
    rating: 4.5,
    bio: 'Business strategy consultant with Fortune 500 experience',
    email: 'michael.chen@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=13',
    availability: generateAvailability()
  },
  {
    name: 'Dr. Emily Williams',
    category: 'Healthcare',
    experience: 15,
    rating: 4.9,
    bio: 'Medical consultant and healthcare policy expert',
    email: 'emily.williams@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=5',
    availability: generateAvailability()
  },
  {
    name: 'James Rodriguez',
    category: 'Marketing',
    experience: 10,
    rating: 4.6,
    bio: 'Digital marketing strategist and growth expert',
    email: 'james.rodriguez@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=12',
    availability: generateAvailability()
  },
  {
    name: 'Dr. Lisa Anderson',
    category: 'Technology',
    experience: 14,
    rating: 4.7,
    bio: 'AI and machine learning researcher',
    email: 'lisa.anderson@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=9',
    availability: generateAvailability()
  },
  {
    name: 'Robert Taylor',
    category: 'Finance',
    experience: 11,
    rating: 4.4,
    bio: 'Investment advisor and financial planning expert',
    email: 'robert.taylor@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=14',
    availability: generateAvailability()
  },
  {
    name: 'Dr. Maria Garcia',
    category: 'Education',
    experience: 9,
    rating: 4.8,
    bio: 'Educational technology and curriculum development specialist',
    email: 'maria.garcia@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=10',
    availability: generateAvailability()
  },
  {
    name: 'David Thompson',
    category: 'Business',
    experience: 13,
    rating: 4.5,
    bio: 'Startup mentor and venture capital advisor',
    email: 'david.thompson@example.com',
    imageUrl: 'https://i.pravatar.cc/150?img=15',
    availability: generateAvailability()
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    await Expert.deleteMany({});
    console.log('Cleared existing experts');

    await Expert.insertMany(experts);
    console.log('Experts seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

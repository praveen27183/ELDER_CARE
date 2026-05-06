import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Task from '../models/Task.js';
import User from '../models/User.js';

// Set DNS servers for MongoDB connection
dns.setServers(['1.1.1.1', '8.8.8.8']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedTasks = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Reenish (Volunteer)
    let volunteer;
    const reenishById = await User.findById('69fb056613a36850e013ca60');
    if (reenishById) {
      console.log(`Found Reenish by ID: ${reenishById._id}`);
      volunteer = reenishById;
    } else {
      const reenish = await User.findOne({ firstName: 'reenish', role: 'volunteer' });
      if (!reenish) {
        console.log('Reenish not found by name. Searching for case-insensitive reenish...');
        const reenishCase = await User.findOne({ firstName: /reenish/i, role: 'volunteer' });
        if (!reenishCase) {
          console.log('Still no Reenish. Searching for any volunteer...');
          const anyVolunteer = await User.findOne({ role: 'volunteer' });
          if (!anyVolunteer) {
            console.log('No volunteer found. Please register a volunteer first.');
            process.exit(1);
          }
          console.log(`Using volunteer: ${anyVolunteer.firstName}`);
          volunteer = anyVolunteer;
        } else {
          console.log(`Found Reenish (case-insensitive): ${reenishCase._id}`);
          volunteer = reenishCase;
        }
      } else {
        console.log(`Found Reenish: ${reenish._id}`);
        volunteer = reenish;
      }
    }

    // Find an Elder
    const elder = await User.findOne({ role: 'elder' });
    if (!elder) {
      console.log('No elder found to associate with tasks.');
      process.exit(1);
    }
    console.log(`Using elder: ${elder.firstName} (${elder._id})`);

    const sampleTasks = [
      {
        title: 'Medicine Delivery',
        description: 'Need to pick up blood pressure medicine from Apollo Pharmacy.',
        urgency: 'high',
        status: 'completed',
        elderId: elder._id,
        elderName: `${elder.firstName} ${elder.lastName}`,
        volunteerId: volunteer._id,
        volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
        taskType: 'Medicine Pickup',
        location: {
          address: 'Anna Nagar West',
          city: 'Chennai',
          coordinates: { latitude: 13.085, longitude: 80.212 }
        },
        taskDetails: {
          items: ['Amlodipine 5mg', 'Telmisartan 40mg'],
          specialInstructions: 'Please check the expiry date.'
        },
        completedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        title: 'Grocery Shopping',
        description: 'Need milk, bread, and some vegetables from the local market.',
        urgency: 'medium',
        status: 'ongoing',
        elderId: elder._id,
        elderName: `${elder.firstName} ${elder.lastName}`,
        volunteerId: volunteer._id,
        volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
        taskType: 'Grocery Shopping',
        location: {
          address: 'T. Nagar',
          city: 'Chennai',
          coordinates: { latitude: 13.041, longitude: 80.233 }
        },
        taskDetails: {
          items: ['Milk 1L', 'Bread', 'Tomatoes 1kg'],
          specialInstructions: 'Fresh items only please.'
        }
      },
      {
        title: 'Companion Care',
        description: 'Would like someone to visit for a chat and perhaps a short walk.',
        urgency: 'low',
        status: 'pending',
        elderId: elder._id,
        elderName: `${elder.firstName} ${elder.lastName}`,
        taskType: 'Companion Care',
        location: {
          address: 'Besant Nagar',
          city: 'Chennai',
          coordinates: { latitude: 12.998, longitude: 80.271 }
        },
        taskDetails: {
          specialInstructions: 'Prefers afternoon visits.'
        }
      }
    ];

    await Task.insertMany(sampleTasks);
    console.log('Successfully seeded tasks!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tasks:', error);
    process.exit(1);
  }
};

seedTasks();

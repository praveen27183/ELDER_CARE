import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Volunteer from "../models/Volunteer.js";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { connectDB } from "../config/db.js";

// Fix for ECONNREFUSED with SRV records
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config({ path: "./.env" });

const VOLUNTEERS = [
  {
    name: "Senthil Kumar",
    role: "Medical Assistant",
    phone: "+91 98765 43210",
    email: "senthil.k@example.com",
    service: "Transport",
    status: "Available",
    location: "Anna Nagar",
    workingAt: "TCS, Siruseri",
    rating: 4.9,
    tasksCompleted: 45,
    verified: "Verified",
    skills: ["Two-Wheeler", "First Aid", "Tamil", "English"],
    joinedDate: "Jan 15, 2024",
    lastSeen: "2 mins ago",
    avatarColor: "bg-emerald-100 text-emerald-700",
    bio: "Passionate about helping elders with transportation and medical visits. I have a two-wheeler and free on weekends.",
    documents: [{ name: "Driving License", status: "Verified" }, { name: "ID Proof", status: "Verified" }]
  },
  {
    name: "Divya Ramesh",
    role: "Registered Nurse",
    phone: "+91 98765 12345",
    email: "divya.r@example.com",
    service: "Medical Aid",
    status: "Busy",
    location: "Adyar",
    workingAt: "Apollo Hospitals",
    rating: 4.9,
    tasksCompleted: 82,
    verified: "Verified",
    skills: ["Medical", "CPR", "BP Check", "Diabetes Care"],
    joinedDate: "Feb 10, 2024",
    lastSeen: "Online",
    avatarColor: "bg-blue-100 text-blue-700",
    bio: "Professional nurse willing to help with basic medical needs and checkups nearby Adyar.",
    documents: [{ name: "Nursing License", status: "Verified" }, { name: "Aadhaar", status: "Verified" }]
  },
  {
    name: "Arun Vijay",
    role: "General Volunteer",
    phone: "+91 98765 67890",
    email: "arun.v@example.com",
    service: "Groceries",
    status: "Offline",
    location: "T. Nagar",
    workingAt: "Freelancer",
    rating: 4.5,
    tasksCompleted: 15,
    verified: "Pending",
    skills: ["Delivery", "Shopping"],
    joinedDate: "Mar 05, 2024",
    lastSeen: "1 hr ago",
    avatarColor: "bg-amber-100 text-amber-700",
    bio: "Can help with grocery shopping and errands in T. Nagar area.",
    documents: [{ name: "ID Proof", status: "Pending" }]
  },
  {
    name: "Priya Krishna",
    role: "Companion",
    phone: "+91 98765 98765",
    email: "priya.k@example.com",
    service: "Companionship",
    status: "Available",
    location: "Velachery",
    workingAt: "Tech Mahindra",
    rating: 5.0,
    tasksCompleted: 28,
    verified: "Verified",
    skills: ["Listening", "Reading", "Chess", "Singing"],
    joinedDate: "Jan 20, 2024",
    lastSeen: "5 mins ago",
    avatarColor: "bg-purple-100 text-purple-700",
    bio: "Love spending time with elders, reading books, and playing board games. I am a patient listener.",
    documents: [{ name: "ID Proof", status: "Verified" }]
  },
  {
    name: "Karthik Raja",
    role: "Emergency Responder",
    phone: "+91 98765 54321",
    email: "karthik.r@example.com",
    service: "Emergency",
    status: "Available",
    location: "Mylapore",
    workingAt: "Student, IIT Madras",
    rating: 4.8,
    tasksCompleted: 12,
    verified: "Verified",
    skills: ["First Aid", "CPR", "Running", "Swimming"],
    joinedDate: "Apr 01, 2024",
    lastSeen: "Online",
    avatarColor: "bg-red-100 text-red-700",
    bio: "Young and active student ready to help in emergency situations. Experienced in scout training.",
    documents: [{ name: "Student ID", status: "Verified" }]
  }
];

const ISSUES = [
  {
    volunteerName: "Arun Vijay",
    volunteerId: 3,
    type: "Missed Task",
    severity: "Medium",
    description: "Failed to show up for a scheduled grocery run for Mrs. Lakshmi.",
    reportedBy: "Lakshmi (Elder)",
    date: "2 days ago",
    status: "Open"
  },
  {
    volunteerName: "Senthil Kumar",
    volunteerId: 1,
    type: "Policy Violation",
    severity: "Low",
    description: "Did not wear the volunteer ID badge during the visit.",
    reportedBy: "System Audit",
    date: "5 days ago",
    status: "Resolved"
  },
  {
    volunteerName: "Karthik R",
    volunteerId: 5,
    type: "Behavior",
    severity: "Critical",
    description: "Rude behavior reported by the elder's family member during a call.",
    reportedBy: "reenish (Family)",
    date: "1 week ago",
    status: "Open"
  }
];

const USERS = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
    phone: "+91 99999 99999",
  },
  {
    firstName: "Praveen",
    lastName: "Raj",
    email: "praveen@test.com",
    password: "password123",
    role: "elder",
    phone: "9292929292",
    age: 65,
    bloodGroup: "O+",
    familyContact: "9876543210",
    address: { street: "123 Elder Lane", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  },
  {
    firstName: "Kishore",
    lastName: "Agilan",
    email: "kishore@test.com",
    password: "password123",
    role: "elder",
    phone: "7904259488",
    age: 70,
    bloodGroup: "A+",
    familyContact: "9123456789",
    address: { street: "456 Wisdom Road", city: "Chennai", state: "Tamil Nadu", pincode: "600020" },
  },
  {
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul@test.com",
    password: "password123",
    role: "elder",
    phone: "8888888888",
    age: 68,
    bloodGroup: "B-",
    familyContact: "7777777777",
    address: { street: "789 Care Street", city: "Chennai", state: "Tamil Nadu", pincode: "600010" },
  },
  {
    firstName: "Sample",
    lastName: "Volunteer",
    email: "volunteer@test.com",
    password: "password123",
    role: "volunteer",
    phone: "+91 77777 77777",
    age: 28,
    skills: ["First Aid", "Driving", "Tamil"],
    address: { street: "456 Help Road", city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  }
];

const TICKETS = [
    {
        user: 'Rukmini Amma',
        role: 'Elder',
        type: 'App Issue',
        subject: 'Voice command not working',
        description: "I am trying to use the voice feature to request medicine but it doesn't respond.",
        status: 'Open',
        priority: 'High',
        time: '10 mins ago',
        avatarColor: 'bg-rose-100 text-rose-700'
    },
    {
        user: 'David Raj',
        role: 'Volunteer',
        type: 'Payment',
        subject: 'Payment not received for Task #1023',
        description: "Completed the grocery run yesterday but wallet balance hasn't updated.",
        status: 'Open',
        priority: 'Medium',
        time: '1 hour ago',
        avatarColor: 'bg-blue-100 text-blue-700'
    },
    {
        user: 'Narayanan S',
        role: 'Elder',
        type: 'General',
        subject: 'How to change language?',
        description: "My app is in English, I want to switch to Tamil.",
        status: 'Resolved',
        priority: 'Low',
        time: 'Yesterday',
        avatarColor: 'bg-emerald-100 text-emerald-700'
    },
    {
        user: 'Priya K',
        role: 'Volunteer',
        type: 'Emergency',
        subject: 'Incorrect Location on Map',
        description: "The location for Mrs. Lakshmi's house is showing 2km away from actual spot.",
        status: 'Pending',
        priority: 'High',
        time: '2 hours ago',
        avatarColor: 'bg-purple-100 text-purple-700'
    },
    {
        user: 'Lakshmi Mom',
        role: 'Elder',
        type: 'General',
        subject: 'Volunteer was very kind',
        description: "Just wanted to appreciate Senthil for his help today.",
        status: 'Resolved',
        priority: 'Low',
        time: '2 days ago',
        avatarColor: 'bg-amber-100 text-amber-700'
    },
    {
        user: 'Karthik R',
        role: 'Volunteer',
        type: 'App Issue',
        subject: 'Cannot upload document',
        description: "Upload button is disabled for my driving license.",
        status: 'Open',
        priority: 'Medium',
        time: '3 hours ago',
        avatarColor: 'bg-cyan-100 text-cyan-700'
    },
    {
        user: 'System Bot',
        role: 'System',
        type: 'General',
        subject: 'Automated Flag: Late Arrival',
        description: "Volunteer marked arrived 30 mins after ETA.",
        status: 'Resolved',
        priority: 'Low',
        time: '1 week ago',
        avatarColor: 'bg-slate-100 text-slate-700'
    },
    {
        user: 'Sarah J',
        role: 'Elder',
        type: 'Payment',
        subject: 'Refund Request',
        description: "I was charged twice for the last medical transport.",
        status: 'Open',
        priority: 'High',
        time: '5 hours ago',
        avatarColor: 'bg-indigo-100 text-indigo-700'
    }
];

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing data
    await Volunteer.deleteMany({});
    await Issue.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});

    console.log("🧹 Database cleared.");

    // Insert Volunteers
    await Volunteer.insertMany(VOLUNTEERS);
    console.log(`✅ ${VOLUNTEERS.length} Volunteers seeded.`);

    // Insert Issues
    await Issue.insertMany(ISSUES);
    console.log(`✅ ${ISSUES.length} Issues seeded.`);

    // Insert Tickets
    await Ticket.insertMany(TICKETS);
    console.log(`✅ ${TICKETS.length} Tickets seeded.`);

    // Insert Users
    // Note: User model has a pre-save hook for password hashing, 
    // but insertMany might bypass it depending on mongoose version/config.
    // To ensure hashing, we'll save them individually.
    for (const userData of USERS) {
      const user = new User(userData);
      await user.save();
    }
    console.log(`✅ ${USERS.length} Auth Users seeded.`);

    console.log("🌟 Seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();

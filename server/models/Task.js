import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
      default: 'pending'
    },
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    elderName: { type: String },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    volunteerName: { type: String, default: null },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    taskType: {
      type: String,
      enum: ['Medicine Pickup', 'Grocery Shopping', 'Companion Care', 'Medical Escort', 'Household Help', 'Emergency'],
      required: true
    },
    taskDetails: {
      items: [String],
      specialInstructions: String,
      preferredTime: Date
    }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;

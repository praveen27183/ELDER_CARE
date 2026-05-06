import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ["Verified", "Pending"], default: "Pending" },
});

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    service: { type: String, required: true },
    status: { type: String, enum: ["Available", "Busy", "Offline"], default: "Offline" },
    location: { type: String, required: true },
    workingAt: { type: String },
    rating: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    verified: { type: String, enum: ["Verified", "Pending"], default: "Pending" },
    skills: [String],
    joinedDate: { type: String },
    lastSeen: { type: String },
    avatarColor: { type: String },
    bio: { type: String },
    documents: [documentSchema],
    pendingUpdate: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
  },
  { timestamps: true }
);

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;

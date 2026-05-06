import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    volunteerName: { type: String, required: true },
    volunteerId: { type: Number }, // Keeping number to match frontend mock IDs
    type: {
      type: String,
      enum: ["Behavior", "Missed Task", "Policy Violation", "Other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "Critical"],
      required: true,
    },
    description: { type: String, required: true },
    reportedBy: { type: String, required: true },
    date: { type: String },
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;

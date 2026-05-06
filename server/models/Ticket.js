import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    role: { type: String, enum: ["Elder", "Volunteer", "System", "Admin"], required: true },
    type: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["Open", "Pending", "Resolved"], default: "Open" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    time: { type: String },
    avatarColor: { type: String }
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;

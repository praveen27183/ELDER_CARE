import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Route Imports
import authRoutes from "./routes/auth.js";
import elderRoutes from "./routes/elders.js";
import volunteerRoutes from "./routes/volunteers.js";
import issueRoutes from "./routes/issues.js";
import taskRoutes from "./routes/tasks.js";
import ticketRoutes from "./routes/tickets.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

// Connect to Database
connectDB();

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Route Mounting
console.log("🚀 Registering modular routes...");
app.use("/api/auth", authRoutes);
app.use("/api/elders", elderRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tickets", ticketRoutes);

// 404 Handler for missing API routes
app.use("/api", (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `API Endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});
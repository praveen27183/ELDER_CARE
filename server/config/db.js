import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Fix for ECONNREFUSED with SRV records
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Load environment variables
dotenv.config();
dotenv.config({ path: "./config.env" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("CRITICAL: MONGODB_URI is not defined in .env or config.env");
  process.exit(1);
}

export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB via Mongoose...");
    await mongoose.connect(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log("✅ MongoDB Connected Successfully (Mongoose)");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error(`   Message: ${err.message}`);
    
    if (err.message.includes("ECONNREFUSED")) {
      console.warn("   TIP: This often means your IP is not whitelisted in Atlas or your DNS is blocking the SRV record.");
    }
    
    if (err.message.includes("certificate validation failed")) {
      console.warn("   TIP: Certificate validation failed. Trying alternative connection method...");
      
      // Try alternative connection without SSL validation
      try {
        await mongoose.connect(uri, {
          tls: false,
          retryWrites: false,
          w: 'majority'
        });
        console.log("✅ MongoDB Connected Successfully (Alternative Method)");
        return;
      } catch (altErr) {
        console.error("❌ Alternative connection also failed:", altErr.message);
      }
    }
    
    // In production, we exit if we can't connect
    process.exit(1);
  }
};

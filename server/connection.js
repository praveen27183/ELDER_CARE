import { MongoClient } from "mongodb";

export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      retryWrites: true,
    });

    await client.connect();
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("❌", err.message);
  }
}
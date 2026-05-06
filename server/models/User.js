import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["elder", "volunteer", "admin"],
      default: "elder",
    },
    phone: { type: String },
    age: { type: Number },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    bloodGroup: { type: String },
    familyContact: { type: String },
    skills: { type: [String], default: [] },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    membership: {
      plan: { 
        type: String, 
        enum: ['Free', 'Monthly', '6 Months'], 
        default: 'Free' 
      },
      status: { 
        type: String, 
        enum: ['active', 'expired', 'none'], 
        default: 'none' 
      },
      startDate: { type: Date },
      expiryDate: { type: Date }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

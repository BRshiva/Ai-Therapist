import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  photo: String,
  personalityType: {
    type: String,
    default: "INFP",
  },
});

export default mongoose.model("User", userSchema);
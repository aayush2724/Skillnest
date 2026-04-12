const mongoose = require("mongoose");

const ProgressLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  skill: { type: String, required: true }, // which skill this session was about
  hoursSpent: { type: Number, default: 1, min: 0.5, max: 24 },
  mood: {
    type: String,
    enum: ["great", "good", "okay", "tough"],
    default: "good",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProgressLog", ProgressLogSchema);

const mongoose = require("mongoose");

const scheduleSlotSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },   // "HH:MM"
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, unique: true, trim: true },
    credits: { type: Number, required: true, min: 1, max: 6 },
    schedule: { type: [scheduleSlotSchema], required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    enrolledSeats: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);

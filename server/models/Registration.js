const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

// One registration record per student
registrationSchema.index({ student: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);

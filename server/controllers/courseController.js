const Course = require("../models/Course");

// GET /api/courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/courses  (teacher only)
const createCourse = async (req, res) => {
  try {
    const { name, code, credits, schedule, totalSeats } = req.body;
    if (!name || !code || !credits || !schedule?.length || !totalSeats) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const course = await Course.create({
      name, code, credits, schedule, totalSeats,
      createdBy: req.user.id,
    });
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Course code already exists." });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCourses, createCourse };

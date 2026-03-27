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

// PUT /api/courses/:id (teacher only)
const updateCourse = async (req, res) => {
  try {
    const { name, code, credits, schedule, totalSeats } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, credits, schedule, totalSeats },
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.json(course);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Course code already exists." });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/courses/:id (teacher only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.json({ message: "Course deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };

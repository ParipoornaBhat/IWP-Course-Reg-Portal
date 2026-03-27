const express = require("express");
const { getCourses, createCourse } = require("../controllers/courseController");
const { auth, requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, getCourses);
router.post("/", auth, requireRole("teacher"), createCourse);

module.exports = router;

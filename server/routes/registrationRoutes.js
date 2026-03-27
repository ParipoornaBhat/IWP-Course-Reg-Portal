const express = require("express");
const { registerCourses, getMyRegistrations } = require("../controllers/registrationController");
const { auth, requireRole } = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, requireRole("student"), registerCourses);
router.get("/me", auth, requireRole("student"), getMyRegistrations);

module.exports = router;

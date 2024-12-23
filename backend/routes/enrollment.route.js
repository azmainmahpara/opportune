import express from "express";
import {
    dropCourse,
    enrollCourse,
    getEnrolledCourses,
    updateProgress
} from "../controllers/enrollment.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/enroll/:courseId").post(isAuthenticated, enrollCourse);
router.route("/get").get(isAuthenticated, getEnrolledCourses);
router.route("/progress/:id").put(isAuthenticated, updateProgress);
router.route("/drop/:id").put(isAuthenticated, dropCourse);

export default router; 
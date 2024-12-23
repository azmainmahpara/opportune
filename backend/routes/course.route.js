import express from "express";
import {
    createCourse,
    enrollInCourse,
    getAdminCourses,
    getAllCourses,
    getCourseById,
    getCourseStudents,
    updateCourse,
    uploadCourseFiles
} from "../controllers/course.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { courseUpload } from "../middlewares/multer.js";

const router = express.Router();

// Public routes (no authentication required)
router.route("/get").get(getAllCourses);
router.route("/get/:id").get(getCourseById);

// Protected routes (authentication required)
router.route("/create").post(isAuthenticated, courseUpload, createCourse);
router.route("/getadmincourses").get(isAuthenticated, getAdminCourses);
router.route("/update/:id").put(isAuthenticated, courseUpload, updateCourse);
router.route("/students/:id").get(isAuthenticated, getCourseStudents);
router.route("/upload").post(isAuthenticated, courseUpload, uploadCourseFiles);
router.route("/enroll/:id").post(isAuthenticated, enrollInCourse);

export default router; 
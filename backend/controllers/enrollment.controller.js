import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";

// Enroll in a course
export const enrollCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.id;

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                message: "You are already enrolled in this course",
                success: false
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId
        });

        // Add enrollment to course
        await Course.findByIdAndUpdate(courseId, {
            $push: { enrollments: enrollment._id }
        });

        return res.status(201).json({
            message: "Successfully enrolled in the course",
            enrollment,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// Get student's enrolled courses
export const getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.id;
        const enrollments = await Enrollment.find({ student: studentId })
            .populate('course')
            .sort({ enrollmentDate: -1 });

        return res.status(200).json({
            enrollments,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// Update enrollment progress
export const updateProgress = async (req, res) => {
    try {
        const { progress } = req.body;
        const enrollmentId = req.params.id;
        const studentId = req.id;

        const enrollment = await Enrollment.findOne({
            _id: enrollmentId,
            student: studentId
        });

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found",
                success: false
            });
        }

        enrollment.progress = progress;
        if (progress === 100) {
            enrollment.status = 'completed';
        }

        await enrollment.save();

        return res.status(200).json({
            message: "Progress updated successfully",
            enrollment,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// Drop a course
export const dropCourse = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const studentId = req.id;

        const enrollment = await Enrollment.findOne({
            _id: enrollmentId,
            student: studentId
        });

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found",
                success: false
            });
        }

        enrollment.status = 'dropped';
        await enrollment.save();

        return res.status(200).json({
            message: "Course dropped successfully",
            enrollment,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
} 
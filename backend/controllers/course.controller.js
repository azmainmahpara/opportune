import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { uploadCourseFile } from "../utils/cloudinary.js";

// Create new course (admin/instructor only)
export const createCourse = async (req, res) => {
    try {
        const { title, description, instructor, price, duration, level, videoLink, resourceLink } = req.body;
        
        let thumbnailData = {};
        let resourcesData = [];

        // Handle thumbnail upload
        if (req.files?.thumbnail) {
            const thumbnailResult = await uploadCourseFile(req.files.thumbnail[0]);
            thumbnailData = {
                public_id: thumbnailResult.public_id,
                url: thumbnailResult.url
            };
        }

        // Handle resource files
        if (req.files?.resources) {
            for (const file of req.files.resources) {
                const resourceResult = await uploadCourseFile(file);
                resourcesData.push({
                    public_id: resourceResult.public_id,
                    url: resourceResult.url,
                    name: file.originalname,
                    type: file.mimetype
                });
            }
        }

        const course = await Course.create({
            title,
            description,
            instructor,
            price: Number(price),
            duration,
            level,
            videoLink: videoLink || "",
            resourceLink: resourceLink || "",
            thumbnail: thumbnailData,
            resources: resourcesData,
            created_by: req.id
        });

        return res.status(201).json({
            message: "Course created successfully",
            course,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || "Error creating course",
            success: false
        });
    }
}

// Get all courses (for students)
export const getAllCourses = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { instructor: { $regex: keyword, $options: "i" } }
            ]
        };

        const courses = await Course.find(query)
            .populate({
                path: 'enrollments',
                populate: {
                    path: 'student',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            courses,
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

// Get single course by ID
export const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId)
            .populate('enrollments');

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
                success: false
            });
        }

        return res.status(200).json({
            course,
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

// Get admin's courses
export const getAdminCourses = async (req, res) => {
    try {
        const adminId = req.id;
        const courses = await Course.find({ created_by: adminId })
            .populate('enrollments')
            .sort({ createdAt: -1 });

        if (!courses) {
            return res.status(404).json({
                message: "No courses found",
                success: false
            });
        }

        return res.status(200).json({
            courses,
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

// Update course
export const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const updates = req.body;

        // Initialize variables for thumbnail and resources
        let thumbnailData = {};
        let resourcesData = [];

        // Handle thumbnail upload if provided
        if (req.files?.thumbnail) {
            const thumbnailResult = await uploadCourseFile(req.files.thumbnail[0]);
            thumbnailData = {
                public_id: thumbnailResult.public_id,
                url: thumbnailResult.url
            };
        }

        // Handle resource uploads if provided
        if (req.files?.resources) {
            for (const file of req.files.resources) {
                const resourceResult = await uploadCourseFile(file);
                resourcesData.push({
                    public_id: resourceResult.public_id,
                    url: resourceResult.url,
                    name: file.originalname,
                    type: file.mimetype
                });
            }
        }

        // Update the course with new data
        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                ...updates,
                ...(Object.keys(thumbnailData).length && { thumbnail: thumbnailData }),
                ...(resourcesData.length && { resources: resourcesData })
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Course updated successfully",
            course,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || "Error updating course",
            success: false
        });
    }
};

// Get course students
export const getCourseStudents = async (req, res) => {
    try {
        const courseId = req.params.id;
        
        const enrollments = await Enrollment.find({ course: courseId })
            .populate({
                path: 'student',
                select: 'fullname email',
                model: 'User'
            })
            .sort({ enrollmentDate: -1 });

        return res.status(200).json({
            enrollments,
            success: true
        });
    } catch (error) {
        console.log('Error in getCourseStudents:', error);
        return res.status(500).json({
            message: "Error fetching students",
            success: false
        });
    }
};

// Add this function to handle file uploads
export const uploadCourseFiles = async (req, res) => {
    try {
        const results = [];
        
        // Handle thumbnail
        if (req.files.thumbnail) {
            const thumbnailResult = await uploadCourseFile(req.files.thumbnail[0]);
            results.push({
                type: 'thumbnail',
                ...thumbnailResult
            });
        }

        // Handle resource files
        if (req.files.resources) {
            for (const file of req.files.resources) {
                const resourceResult = await uploadCourseFile(file);
                results.push({
                    type: 'resource',
                    name: file.originalname,
                    mimetype: file.mimetype,
                    ...resourceResult
                });
            }
        }

        return res.status(200).json({
            message: "Files uploaded successfully",
            files: results,
            success: true
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            message: error.message || "Error uploading files",
            success: false
        });
    }
};

export const enrollInCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
                success: false
            });
        }

        // Check if user is already enrolled
        const existingEnrollment = await Enrollment.findOne({
            course: courseId,
            student: userId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                message: "You are already enrolled in this course",
                success: false
            });
        }

        // Create new enrollment
        const enrollment = await Enrollment.create({
            course: courseId,
            student: userId,
            status: 'active',
            progress: 0
        });

        // Add enrollment reference to course
        course.enrollments.push(enrollment._id);
        await course.save();

        return res.status(200).json({
            message: "Successfully enrolled in course",
            enrollment,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error enrolling in course",
            success: false
        });
    }
}; 
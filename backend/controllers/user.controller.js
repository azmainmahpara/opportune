import bcrypt from "bcryptjs";
import cloudinary from 'cloudinary';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Readable } from 'stream';
import { Application } from "../models/application.model.js";
import { Company } from "../models/company.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Job } from "../models/job.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { uploadProfilePhoto, uploadResume } from "../utils/cloudinary.js";

// Helper function to upload buffer to cloudinary
const uploadBuffer = (buffer, folder = 'chat_files') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        
        const readableStream = new Readable({
            read() {
                this.push(buffer);
                this.push(null);
            }
        });
        
        readableStream.pipe(stream);
    });
};

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        // Validate input data
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        // Check if the file is uploaded
        if (!req.file || !req.file.originalname) {
            return res.status(400).json({
                message: "No file uploaded or file is missing 'originalname'",
                success: false
            });
        }

        // Upload the profile photo using the utility function
        const uploadResult = await uploadProfilePhoto(req.file);

        // Create the user in the database
        const user = await User.create({
            fullname,
            email,
            phoneNumber,
            password: await bcrypt.hash(password, 10),
            role,
            profile: {
                profilePhoto: uploadResult.url,
            }
        });

        // Check if user creation was successful
        if (!user) {
            return res.status(500).json({
                message: "User creation failed",
                success: false
            });
        }

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profilePhoto: uploadResult.url,
            }
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        console.log(req.files); // Log the received files

        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const userId = req.id;

        // Fetch the existing user data
        const existingUser = await User.findById(userId);

        // Prepare the update data
        const updateData = {
            ...(fullname && { fullname }),
            ...(email && { email }),
            ...(phoneNumber && { phoneNumber }),
        };

        // Initialize profile updates
        const profileUpdates = existingUser.profile || {}; // Start with existing profile data

        // Handle profile photo upload
        if (req.files && req.files.profilePhoto) {
            const profilePhoto = req.files.profilePhoto[0];
            const uploadResult = await uploadProfilePhoto(profilePhoto); // Use the new upload function
            profileUpdates.profilePhoto = uploadResult.url; // Update the profilePhoto field
        }

        // Handle resume upload if needed
        if (req.files && req.files.file) { // Ensure the field name matches
            const resume = req.files.file[0]; // Adjusted to match the field name
            const resumeUploadResult = await uploadResume(resume); // Use the upload function
            profileUpdates.resume = resumeUploadResult.url; // Update the resume field
            profileUpdates.resumeOriginalName = resume.originalname; // Store the original name
        }

        // Update bio and skills if provided
        if (bio) profileUpdates.bio = bio;
        if (skills) profileUpdates.skills = skills.split(',').map(skill => skill.trim());

        // Merge profile updates into updateData
        updateData.profile = profileUpdates; // Set the updated profile

        console.log("Update Data:", updateData); // Log the update data before the update call

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        return res.status(200).json({ user, success: true, message: "Profile updated successfully." });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Error updating profile", success: false });
    }
};
export const getUsers = async (req, res) => {
    try {
        const { searchRole, search } = req.query;
        const userId = req.id;

        // Debug logs
        console.log('Search Parameters:', {
            searchRole,
            search,
            currentUserId: userId
        });

        const query = {
            _id: { $ne: userId },
            role: searchRole
        };

        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('MongoDB Query:', query);

        const users = await User.find(query)
            .select('fullname email role phoneNumber profile')
            .limit(20);

        console.log('Found Users:', users);

        return res.status(200).json({
            message: "Users fetched successfully",
            users,
            success: true
        });

    } catch (error) {
        console.log('Error in getUsers:', error);
        return res.status(500).json({
            message: "Error fetching users",
            success: false
        });
    }
};
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                senderId: userId,
                receiverId: currentUserId,
                readAt: null
            },
            {
                readAt: new Date()
            }
        );

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching messages"
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.id;
        let fileUrl = null;
        let fileType = null;

        // Handle file upload if present
        if (req.file) {
            try {
                const result = await uploadBuffer(req.file.buffer);
                fileUrl = result.secure_url;
                fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading file"
                });
            }
        }

        const message = await Message.create({
            senderId,
            receiverId,
            content: content || '',
            fileUrl,
            fileType
        });

        // If you have socket.io set up
        if (req.app.io) {
            req.app.io.to(`user_${receiverId}`).emit('new_message', message);
        }

        return res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: "Error sending message"
        });
    }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.id;

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if the user owns this message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages"
      });
    }

    // Soft delete the message
    message.deleted = true;
    message.content = "This message has been deleted";
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.id;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        readAt: null
      },
      {
        readAt: new Date()
      }
    );

    // Emit socket event for real-time update
    req.app.io.to(`user_${senderId}`).emit('messages_read', {
      receiverId
    });

    return res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: "Error marking messages as read"
    });
  }
};

export const getChatUsers = async (req, res) => {
    try {
        const { searchRole, search } = req.query;
        const currentUserId = req.id;

        const query = {
            _id: { $ne: currentUserId }, // Exclude current user
            role: searchRole // Filter by role
        };

        // Add search conditions if search query exists
        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('fullname email profile.profilePhoto role')
            .limit(10);

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching chat users:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching users"
        });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const currentUserId = req.id;

        // Find all unique conversations excluding deleted messages
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(currentUserId) },
                        { receiverId: new mongoose.Types.ObjectId(currentUserId) }
                    ],
                    deleted: false // Exclude deleted messages
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", new mongoose.Types.ObjectId(currentUserId)] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ["$receiverId", new mongoose.Types.ObjectId(currentUserId)] },
                                        { $eq: ["$readAt", null] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 1,
                    user: {
                        _id: 1,
                        fullname: 1,
                        email: 1,
                        "profile.profilePhoto": 1
                    },
                    lastMessage: 1,
                    unreadCount: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching chat history"
        });
    }
};

export const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.id;

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if the user owns this message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages"
      });
    }

    // Update the message
    message.content = content;
    message.edited = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message
    });

  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Recruiter Profile
export const getRecruiterProfile = async (req, res) => {
    try {
        const userId = req.id; // Assuming you have user ID in the request
        const user = await User.findById(userId);

        if (!user || user.role !== 'recruiter') {
            return res.status(404).json({ message: "Recruiter not found", success: false });
        }

        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        return res.status(500).json({ message: "Error fetching profile", success: false });
    }
};

// Update Recruiter Profile azmain
export const updateRecruiterProfile = async (req, res) => {
    try {
        const { company, email, phoneNumber, bio } = req.body;
        const userId = req.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { company, email, phoneNumber, profile: { bio } },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ user: updatedUser, success: true });
    } catch (error) {
        console.error('Error updating recruiter profile:', error);
        return res.status(500).json({ message: "Error updating profile", success: false });
    }
};

export const deleteUser = async (req, res) => {
    const userId = req.params.id;
    console.log(`Attempting to delete user with ID: ${userId}`); // Log the user ID

    try {
        // Find the user to check their role azmain
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Delete associated data from other collections
        if (user.role === 'recruiter') {
            // If the user is a recruiter, delete applications, enrollments, and courses
            const jobs = await Job.find({ created_by: userId });
            const jobIds = jobs.map(job => job._id);

            // Find courses created by the recruiter
            const courses = await Course.find({ created_by: userId });
            const courseIds = courses.map(course => course._id);

            await Promise.all([
                Application.deleteMany({ job: { $in: jobIds } }), // Delete applications for jobs created by this recruiter
                Enrollment.deleteMany({ course: { $in: courseIds } }), // Delete enrollments for courses created by this recruiter
                Company.deleteMany({ userId }),
                Job.deleteMany({ created_by: userId }),
                Course.deleteMany({ created_by: userId }), // Delete courses created by this recruiter
                Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] })
            ]);
        } else if (user.role === 'student') {
            // If the user is a student delete their applications and enrollments
            await Promise.all([
                Application.deleteMany({ applicant: userId }),
                Enrollment.deleteMany({ student: userId }),
                Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] })
            ]);
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        return res.status(200).json({ message: "User deleted successfully", success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Error deleting user", success: false });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        console.log("Request parameters:", req.params);

        const { userId } = req.params; // The ID of the user with whom the conversation is held
        const currentUserId = req.id; // The ID of the current user (senderId)

        console.log("User connected:", currentUserId);
        console.log("Deleting messages between:", currentUserId, userId);

        // Soft delete all messages between the two users
        const result = await Message.updateMany(
            {
                $or: [
                    { senderId: currentUserId, receiverId: userId },
                    { senderId: userId, receiverId: currentUserId }
                ]
            },
            { $set: { deleted: true, content: "This message has been deleted" } }
        );

        console.log("Messages updated:", result);

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No messages found to delete"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Conversation and messages marked as deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting conversation"
        });
    }
};
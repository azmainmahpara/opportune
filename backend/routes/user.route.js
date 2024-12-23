import express from "express";
import multer from 'multer';
import {
    deleteConversation,
    deleteMessage,
    deleteUser,
    getChatHistory,
    getChatUsers,
    getMessages,
    getRecruiterProfile,
    login,
    logout,
    markMessagesAsRead,
    register,
    sendMessage,
    updateMessage,
    updateProfile,
    updateRecruiterProfile
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { profileUpload } from "../middlewares/multer.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Existing routes
router.post("/register", upload.single('profilePhoto'), register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/profile/update", isAuthenticated, profileUpload, updateProfile);

// Chat routes
router.get("/messages/:userId", isAuthenticated, getMessages);
router.post("/messages", isAuthenticated, profileUpload, sendMessage);
router.delete("/messages/:messageId", isAuthenticated, deleteMessage);
router.post("/messages/read/:senderId", isAuthenticated, markMessagesAsRead);
router.get("/chat-users", isAuthenticated, getChatUsers);
router.get("/chat-history", isAuthenticated, getChatHistory);
router.put("/messages/:messageId", isAuthenticated, updateMessage);

router.get("/recruiter/profile", isAuthenticated, getRecruiterProfile);
router.put("/recruiter/profile", isAuthenticated, updateRecruiterProfile);

// Protected route for deleting a user
router.delete("/delete/:id", isAuthenticated, deleteUser);

router.delete('/messages/conversation/:userId', isAuthenticated, deleteConversation);

export default router;


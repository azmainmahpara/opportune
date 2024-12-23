import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import applicationRoute from "./routes/application.route.js";
import companyRoute from "./routes/company.route.js";
import courseRoute from "./routes/course.route.js";
import enrollmentRoute from "./routes/enrollment.route.js";
import jobRoute from "./routes/job.route.js";
import userRoute from "./routes/user.route.js";
import connectDB from "./utils/db.js";

dotenv.config({});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Make io available in routes
app.io = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user_connected', (userId) => {
    console.log('User connected:', userId);
    socket.join(userId);
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    socket.to(receiverId).emit('typing', { senderId });
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    socket.to(receiverId).emit('stop_typing', { senderId });
  });

  socket.on('message_deleted', ({ messageId, receiverId }) => {
    socket.to(receiverId).emit('message_deleted', { messageId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/enrollment", enrollmentRoute);

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});
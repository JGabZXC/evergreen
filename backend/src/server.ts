import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import { HttpStatus } from "./domain/HttpStatus";
import authRoutes from "./interfaces/http/routes/authRoutes";
import registrarRoutes from "./interfaces/http/routes/registrarRoutes";
import userRoutes from "./interfaces/http/routes/userRoutes";
import studentRoutes from "./interfaces/http/routes/studentRoutes";
import subjectRoutes from "./interfaces/http/routes/subjectRoutes";
import scheduleRoutes from "./interfaces/http/routes/scheduleRoutes";
import teacherRoutes from "./interfaces/http/routes/teacherRoutes";
import courseRoutes from "./interfaces/http/routes/courseRoutes";
import roomRoutes from "./interfaces/http/routes/roomRoutes";
import subjectTakenRoutes from "./interfaces/http/routes/subjectTakenRoutes";
import announcementRoutes from "./interfaces/http/routes/announcementRoutes";
import schoolYearRoutes from "./interfaces/http/routes/schoolYearRoutes";

dotenv.config({
  path: "../.env",
});

const app = express();
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/registrar", registrarRoutes);
app.use("/api/user", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/subject-taken", subjectTakenRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/school-year", schoolYearRoutes);

app.use(errorHandler);

app.use((req, res) => {
  const route = req.originalUrl;
  res
    .status(HttpStatus.NOT_FOUND)
    .json({ message: `Route not found: ${route}` });
});
mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/evergreen")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

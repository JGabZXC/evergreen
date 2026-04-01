import express, {Response, Request} from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import authRoutes from "./interfaces/http/routes/AuthRoutes";
import teacherAcademicBackgroundRoutes from "./interfaces/http/routes/TeacherAcademicBackgroundRoutes";
import { HttpStatus } from "./domain/enums/HttpStatus";

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
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/teacher-academic-backgrounds", teacherAcademicBackgroundRoutes);

app.use(errorHandler);

app.use((req: Request, res: Response) => {
  const route = req.originalUrl;
  res
    .status(HttpStatus.NOT_FOUND)
    .json({ message: `Route not found: ${route}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

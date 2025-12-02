import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import authRoutes from "./interfaces/http/routes/authRoutes";
import registrarRoutes from "./interfaces/http/routes/registrarRoutes";
import userRoutes from "./interfaces/http/routes/userRoutes";

dotenv.config({
  path: "../.env",
});

const app = express();
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/registrar", registrarRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/evergreen")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

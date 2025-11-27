import express from "express";
import userRoutes from "./interfaces/http/routes/userRoutes";
import authRoutes from "./interfaces/http/routes/authRoutes";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config({
  path: "../.env",
});

const app = express();
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(cookieParser());

app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/evergreen")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

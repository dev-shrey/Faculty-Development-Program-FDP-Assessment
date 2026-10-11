import express from "express";
import cors from "cors";
import helmet from "helmet";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === 'development') {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
        if (allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
          return callback(null, true);
        }
      }
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }
      callback(null, true);
    },
  })
);

app.use(express.json());
app.use("/api/students", studentRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "MERN FDP API is running",
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON request body" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body is too large" });
  }
  console.error("Unhandled API error:", error.message);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;

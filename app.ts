import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/db/connection";
import authRoutes from "./src/routes/authRoutes";
import cmsRoutes from "./src/routes/cmsRoutes";
import apiRoutes from "./src/routes/apiRoutes";

dotenv.config();

const app = express();

// Security Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/auth", limiter);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));
app.use(express.static(path.join(process.cwd(), "public")));
// Routes
app.use("/", authRoutes);
app.use("/", cmsRoutes);
app.use("/api/data", apiRoutes);

app.get("/", (req: express.Request, res: express.Response) =>
  res.redirect("/dashboard"),
);

// Fix 2: cast PORT to number so TypeScript accepts it
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`CMS Backend running on port ${PORT}`);
  await connectDB();
});

export default app;

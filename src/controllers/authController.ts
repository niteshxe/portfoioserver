import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Auth from "../models/Auth";
import OTP from "../models/OTP";
import { sendOTP } from "../utils/mail";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_me";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user: any = await Auth.findOne({ username });

    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: "4h" });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 14400000,
      });
      return res.redirect("/dashboard");
    }
    res.render("login", { error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "An error occurred during authentication" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/login");
};

// --- Registration Logic ---


export const postRegister = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    // Check if any user already exists
    const userCount = await Auth.countDocuments();
    if (userCount > 0) {
      return res.render("register", { error: "Registration is disabled: an admin already exists." });
    }

    // Check if username specifically already exists (safety)
    const existingUser = await Auth.findOne({ username });
    if (existingUser) {
      return res.render("register", { error: "Username already taken" });
    }

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    // Store OTP and temporary user data
    await OTP.findOneAndUpdate(
      { email },
      { 
        otp, 
        userData: { username, password },
        createdAt: new Date() 
      },
      { upsert: true, new: true }
    );

    // Send OTP via email
    await sendOTP(email, otp);

    // Redirect to OTP verification page
    res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error("Registration error:", error);
    res.render("register", { error: "An error occurred during registration" });
  }
};

export const getVerifyOTP = (req: Request, res: Response) => {
  const { email } = req.query;
  res.render("verify-otp", { email, error: null });
};

export const postVerifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const otpRecord: any = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.render("verify-otp", { 
        email, 
        error: "Invalid or expired OTP" 
      });
    }

    // OTP is valid, create the final user
    const { username, password } = otpRecord.userData;
    await Auth.create({ username, password });

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Redirect to login with success message (or just login)
    res.redirect("/login");
  } catch (error) {
    console.error("OTP verification error:", error);
    res.render("verify-otp", { 
      email: req.body.email, 
      error: "An error occurred during verification" 
    });
  }
};




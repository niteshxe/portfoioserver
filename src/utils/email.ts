import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpPort = parseInt(process.env.SMTP_PORT || "465");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // Use SSL for port 465, TLS for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email sending functionality disabled

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

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email service ready - SMTP connected");
  }
});

export const sendLoginNotification = async (ip: string, userAgent: string) => {
  const mailOptions = {
    from: `"CMS Security" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: "⚠️ CMS Login Notification",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Login Detected</h2>
        <p>A successful login was detected on your Portfolio CMS dashboard.</p>
        <hr/>
        <p><strong>IP Address:</strong> ${ip}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Device:</strong> ${userAgent}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">If this wasn't you, please change your admin password immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Login notification email sent.");
  } catch (error) {
    console.error("Error sending login notification email:", error);
  }
};

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const { SMTP_EMAIL, SMTP_PASS, SMTP_HOST } = process.env;

// Configure nodemailer transporter
const transporter = nodemailer.createTransport(
  {
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASS,
    },
  },
  {
    from: `"Auth System" <${process.env.SMTP_EMAIL}>`,
  }
);

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

/**
 * Send email with provided options
 * @param {Object} mailOptions - email sending options
 * @returns {Promise}
 */
export const sendEmail = async (mailOptions) => {
  if (
    !mailOptions ||
    !mailOptions.to ||
    !mailOptions.subject ||
    !mailOptions.html
  ) {
    throw new Error("Missing required email parameters: to, subject, or html.");
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

/**
 * Send activation email to user
 * @param {Object} user - User object
 * @param {String} email - Email address
 * @returns {Promise}
 */
export const sendActivationEmail = async (user, email) => {
  // Generate activation token
  const token = crypto.randomBytes(32).toString("hex");

  // Set token and expiry in user document
  user.activationToken = token;
  user.activationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Get the current file's directory path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Read email template
  const templatePath = path.join(__dirname, "setPasswordEmailTemplate.html");
  let htmlTemplate = "";

  try {
    htmlTemplate = fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    console.error("Error reading email template:", error);
    // Fallback template if file doesn't exist
    htmlTemplate = `
      <h1>Set Your Password</h1>
      <p>Hello,</p>
      <p>We're excited to have you on board. Please set up your password to access your account. Click the link below to get started:</p>
      <p><a href="{{activationLink}}">Set Your Password</a></p>
      <p>If the link doesn't work, you can also copy and paste this link into your browser:</p>
      <p>{{activationLink}}</p>
    `;
  }

  // Set activation link in template
  const activationLink = `${process.env.CLIENT_ORIGIN}/set-password?token=${token}`;
  htmlTemplate = htmlTemplate.replace(/{{activationLink}}/g, activationLink);

  // Send email
  await sendEmail({
    to: email,
    subject: "Set Your Password",
    html: htmlTemplate,
  });
};
console.log("SMTP Host:", process.env.SMTP_HOST);

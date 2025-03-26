import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASS } = process.env;

// Create transporter using environment variables

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp-relay.brevo.com", // Use Gmail as default or your SMTP provider
  port: SMTP_PORT || 587,
  secure: false,
  auth: {
    user: SMTP_EMAIL || "7e848b004@smtp-brevo.com",
    pass: SMTP_PASS || "5OE8NxLrHsXzbt9I",
  },
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("Email service ready");
  }
});

// Send email function
export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error(
      "Missing required email parameters: to, subject, and either text or html"
    );
  }

  try {
    const info = await transporter.sendMail({
      from: "webcseiitism@gmail.com",
      to,
      subject,
      text,
      html,
      attachments,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Send activation email
export const sendActivationEmail = async (user, email) => {
  // Read template file
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "activation-email.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Generate activation token
  const token = user.generateActivationToken();
  await user.save();

  // Create activation link
  const activationLink = `${process.env.CLIENT_URL}/set-password?token=${token}`;

  // Replace placeholders in template
  htmlTemplate = htmlTemplate
    .replace(/{{name}}/g, user.name)
    .replace(/{{activationLink}}/g, activationLink);

  // Send the email
  return sendEmail({
    from: "webcseiitism@gmail.com",
    to: email,
    subject: "Account Activation - Set Your Password",
    html: htmlTemplate,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (user) => {
  // Read template file
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "reset-password-email.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save();

  // Create reset link
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  // Replace placeholders in template
  htmlTemplate = htmlTemplate
    .replace(/{{name}}/g, user.name)
    .replace(/{{resetLink}}/g, resetLink);

  // Send the email
  return sendEmail({
    from: "webcseiitism@gmail.com",
    to: user.email,
    subject: "Password Reset Request",
    html: htmlTemplate,
  });
};

export default {
  sendEmail,
  sendActivationEmail,
  sendPasswordResetEmail,
};

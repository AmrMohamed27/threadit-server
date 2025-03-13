import nodemailer from "nodemailer";
import { env } from "../env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GOOGLE_APP_HOST,
    pass: env.GOOGLE_APP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async ({ to, subject, text }: SendEmailParams) => {
  try {
    const mailOptions = {
      from: env.GOOGLE_APP_HOST,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

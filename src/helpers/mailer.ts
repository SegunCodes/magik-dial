import { EmailDataTypes } from "../utils/types";
import transporter from "../config/nodemailer.config";

// Define the sendEmail function
export async function sendEmail(emailData: EmailDataTypes): Promise<void> {
  try {
    await transporter.sendMail({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
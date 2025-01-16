import sgMail from "@sendgrid/mail";
import { createTransport } from "nodemailer";
import { renderFile } from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { htmlToText } from "html-to-text";
import dotenv from "dotenv";
dotenv.config("./.env");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `edekefayinana@gmail.com`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return null;
    } else {
      return createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async send(template, subject) {
    const templatePath = path.resolve(__dirname, `../template/${template}.ejs`);

    try {
      const emailHtml = await renderFile(templatePath, {
        name: this.firstName,
        url: this.url,
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html: emailHtml,
        text: htmlToText(emailHtml),
      };

      if (process.env.NODE_ENV === "production") {
        const msg = {
          to: this.to,
          from: this.from,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text,
        };

        await sgMail.send(msg);
      } else {
        // Send email using nodemailer in development
        const transport = this.newTransport();
        await transport.sendMail(mailOptions);
      }
    } catch (error) {
      console.error(
        "Error sending email:",
        error.response?.body?.errors || error.message
      );
    }
  }

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the Apple Store!");
  }

  async resetPasswordLink() {
    await this.send("ResetPasswordLink", "Reset Password");
  }
}

export default Email;

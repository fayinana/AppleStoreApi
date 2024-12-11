import { createTransport } from "nodemailer";
import { renderFile } from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { htmlToText } from "html-to-text";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Apple Store <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
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
        name: this.firstName, // Use firstName instead of name
        url: this.url,
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html: emailHtml,
        text: htmlToText(emailHtml),
      };

      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
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

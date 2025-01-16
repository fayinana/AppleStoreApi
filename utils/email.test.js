import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import { renderFile } from "ejs";
import { htmlToText } from "html-to-text";
import Email from "./email";

jest.mock("@sendgrid/mail");
jest.mock("nodemailer");
jest.mock("ejs");
jest.mock("html-to-text");

describe("Email class", () => {
  const user = { email: "test@example.com", firstName: "John" };
  const url = "http://example.com";
  let email;

  beforeEach(() => {
    email = new Email(user, url);
  });

  describe("send method", () => {
    it("should generate emailHtml and send email using nodemailer in development", async () => {
      process.env.NODE_ENV = "development";
      const transport = { sendMail: jest.fn() };
      nodemailer.createTransport.mockReturnValue(transport);
      renderFile.mockResolvedValue("<html>Email content</html>");
      htmlToText.mockReturnValue("Email content");

      await email.send("template", "Subject");

      expect(renderFile).toHaveBeenCalledWith(expect.any(String), {
        name: user.firstName,
        url: url,
      });
      expect(htmlToText).toHaveBeenCalledWith("<html>Email content</html>");
      expect(transport.sendMail).toHaveBeenCalledWith({
        from: email.from,
        to: email.to,
        subject: "Subject",
        html: "<html>Email content</html>",
        text: "Email content",
      });
    });

    it("should generate emailHtml and send email using SendGrid in production", async () => {
      process.env.NODE_ENV = "production";
      renderFile.mockResolvedValue("<html>Email content</html>");
      htmlToText.mockReturnValue("Email content");

      await email.send("template", "Subject");

      expect(renderFile).toHaveBeenCalledWith(expect.any(String), {
        name: user.firstName,
        url: url,
      });
      expect(htmlToText).toHaveBeenCalledWith("<html>Email content</html>");
      expect(sgMail.send).toHaveBeenCalledWith({
        to: email.to,
        from: email.from,
        subject: "Subject",
        html: "<html>Email content</html>",
        text: "Email content",
      });
    });
  });

  describe("sendWelcome method", () => {
    it("should call send method with correct parameters", async () => {
      jest.spyOn(email, "send").mockResolvedValue();

      await email.sendWelcome();

      expect(email.send).toHaveBeenCalledWith(
        "Welcome",
        "Welcome to the Apple Store!"
      );
    });
  });

  describe("resetPasswordLink method", () => {
    it("should call send method with correct parameters", async () => {
      jest.spyOn(email, "send").mockResolvedValue();

      await email.resetPasswordLink();

      expect(email.send).toHaveBeenCalledWith(
        "ResetPasswordLink",
        "Reset Password"
      );
    });
  });
});

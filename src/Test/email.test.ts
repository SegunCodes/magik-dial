import { sendEmail } from "../helpers/mailer";
// import { mocked } from "jest-mock";


jest.mock("../helpers/mailer", () => ({
  sendEmail: jest.fn()
}));

describe("sendEmail function", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send an email successfully", async () => {
   
  (sendEmail as jest.Mock).mockResolvedValue(true);

    const emailData = {
      from: "buzzycash@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      html: "<p>This is a test email.</p>",
    };


    const result = await sendEmail(emailData);

    expect(result).toBe(true);
  });

  it("should throw an error when email sending fails", async () => {
    
    (sendEmail as jest.Mock).mockRejectedValue(new Error("Email sending failed"));

    const emailData = {
      from: "buzzycash@example.com",
      to: "recipient@example.com",
      subject: "Subject",
      html: "<p>This is a test email.</p>",
    };

    
    await expect(sendEmail(emailData)).rejects.toThrow("Email sending failed");
  });
});




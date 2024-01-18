import nodemailer, { TransportOptions } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.HOST as string,
  port: parseInt(process.env.EMAIL_PORT as string)|| 465,
  auth: {
    user: process.env.EMAIL_ADDRESS as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

export default transporter;

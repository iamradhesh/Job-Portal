import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });
    await consumer.connect();

    const topicName = "send-mail";
    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    console.log("✅ Mail Service Consumer Started Listening for Sending Mails");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || "{}");
          const { to, subject, html } = data;

          if (!to || !subject) {
            console.log("❌ Invalid email payload:", data);
            return;
          }

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.MAIL_USER,  // Gmail address
              pass: process.env.MAIL_PASS,  // App password
            },
          });

          await transporter.sendMail({
            from: `"HireHub" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html,
          });

          console.log(`📨 Mail has been sent to ${to}`);
        } catch (error) {
          console.log("❌ Failed to send Mail", error);
        }
      },
    });
  } catch (error) {
    console.log("❌ Failed to Start Kafka consumer", error);
  }
};

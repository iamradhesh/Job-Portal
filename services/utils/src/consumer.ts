import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

dotenv.config();

// ---------------- Helper to read cert files ----------------
const cert = (file: string) => {
  const certPath = process.env.KAFKA_CERTS_PATH;
  if (!certPath) {
    throw new Error("❌ KAFKA_CERTS_PATH is not defined in .env");
  }

  const filePath = path.resolve(certPath, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Cert file not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf-8");
};

// ---------------- Validate Gmail credentials ----------------
const getMailCredentials = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "❌ MAIL_USER or MAIL_PASS is missing in .env. " +
        "Use Gmail App Password, not your normal password."
    );
  }

  return { user, pass };
};

// ---------------- Kafka Mail Consumer ----------------
export const startSendMailConsumer = async () => {
  try {
    // -------- Kafka connection --------
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
      ssl: {
        rejectUnauthorized: true,
        ca: [cert("ca.pem")],
        cert: cert("service.cert"),
        key: cert("service.key"),
      },
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });
    await consumer.connect();

    const topicName = "send-mail";
    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    console.log("✅ Mail Service Consumer Started Listening for Sending Mails");

    const { user, pass } = getMailCredentials();

    // -------- Run consumer --------
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
  try {
    const value = message.value?.toString();
     console.log(`📥 Raw message from topic "${topic}":`, message);
  console.log("Message value string:", message.value?.toString());
    
    const data = JSON.parse(value || "{}");
    const { to, subject, html } = data;

    if (!to || !subject) {
      console.log("❌ Invalid email payload:", data);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"HireHub" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`📨 Mail has been sent to ${to}`);
  } catch (error) {
    console.log("❌ Failed to send Mail", error);
  }
}

    });
  } catch (error) {
    console.log("❌ Failed to Start Kafka consumer", error);
  }
};

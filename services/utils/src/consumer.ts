import { Kafka, logLevel } from "kafkajs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// ---------------- Logging helper ----------------
const log = (tag: string, ...args: any[]) =>
  console.log(`[MAIL-CONSUMER][${tag}]`, ...args);

// ---------------- Kafka SSL from ENV ----------------
// ---------------- Kafka SSL from ENV (Base64) ----------------
const getKafkaSSL = () => {
  const caB64 = process.env.KAFKA_CA_CERT;
  const certB64 = process.env.KAFKA_CLIENT_CERT;
  const keyB64 = process.env.KAFKA_CLIENT_KEY;

  if (!caB64 || !certB64 || !keyB64) {
    throw new Error("❌ Kafka SSL certs missing in ENV");
  }

  return {
    rejectUnauthorized: true,
    ca: [Buffer.from(caB64, "base64").toString("utf-8")],
    cert: Buffer.from(certB64, "base64").toString("utf-8"),
    key: Buffer.from(keyB64, "base64").toString("utf-8"),
  };
};


// ---------------- Validate Gmail credentials ----------------
const getMailCredentials = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || !pass) {
    throw new Error("❌ MAIL_USER or MAIL_PASS missing in environment variables");
  }

  return { user, pass };
};

// ---------------- Kafka Mail Consumer ----------------
export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER!],
      ssl: getKafkaSSL(),
      logLevel: logLevel.INFO,
    });

    const consumer = kafka.consumer({
      groupId: "mail-service-group",
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "send-mail", fromBeginning: false });

    log("STATUS", "✅ Mail consumer started");

    const { user, pass } = getMailCredentials();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await consumer.run({
      autoCommit: true,
      eachMessage: async ({ topic, partition, message }) => {
        const raw = message.value?.toString();

        log(
          "RECEIVED",
          `topic=${topic} partition=${partition} offset=${message.offset}`
        );

        if (!raw) {
          log("WARN", "Empty message received");
          return;
        }

        try {
          const data = JSON.parse(raw);
          const { to, subject, html } = data;

          if (!to || !subject) {
            throw new Error("Invalid email payload");
          }

          await transporter.sendMail({
            from: `"HireHub" <${user}>`,
            to,
            subject,
            html,
          });

          log("MAIL", `📨 Sent to ${to}`);
        } catch (err) {
          console.error("❌ Mail processing failed:", err);
          throw err; // Kafka will retry
        }
      },
    });
  } catch (error) {
    console.error("❌ Failed to start Kafka consumer", error);
    process.exit(1);
  }
};

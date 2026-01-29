import "dotenv/config";
import { Kafka, type Producer, type Admin, logLevel } from "kafkajs";
import nodemailer from "nodemailer";

// ---------------- Globals ----------------
let producer: Producer;
let admin: Admin;

// ---------------- Logging helper ----------------
const log = (prefix: string, ...args: any[]) =>
  console.log(`[${prefix}]`, ...args);

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
  if (!user || !pass)
    throw new Error("❌ MAIL_USER or MAIL_PASS missing");
  return { user, pass };
};

// ---------------- Kafka instance ----------------
const createKafka = (clientId: string) =>
  new Kafka({
    clientId,
    brokers: [process.env.KAFKA_BROKER!],
    ssl: getKafkaSSL(),
    logLevel: logLevel.INFO,
  });

// ---------------- Connect Kafka ----------------
export const connectKafka = async () => {
  try {
    const kafka = createKafka("auth-service");

    // ---------- ADMIN ----------
    admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();
    log("Kafka", "Existing topics:", topics);

    if (!topics.includes("send-mail")) {
      await admin.createTopics({
        topics: [{ topic: "send-mail", numPartitions: 1, replicationFactor: 1 }],
      });
      log("Kafka", "✅ Topic 'send-mail' created");
    }

    await admin.disconnect();

    // ---------- PRODUCER ----------
    producer = kafka.producer({ allowAutoTopicCreation: false });
    await producer.connect();
    log("Kafka", "✅ Connected to Kafka Producer");
  } catch (err) {
    console.error("❌ Failed to connect to Kafka", err);
    throw err;
  }
};

// ---------------- Publish to Kafka ----------------
export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) throw new Error("Kafka producer not initialized");

  log("Producer", `📤 Publishing to ${topic}`);
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
    acks: -1,
  });
  log("Producer", `✅ Message published to ${topic}`);
};

// ---------------- Kafka Mail Consumer ----------------
// export const startSendMailConsumer = async () => {
//   try {
//     const kafka = createKafka("mail-service");
//     const consumer = kafka.consumer({ groupId: "mail-service-group" });

//     await consumer.connect();
//     await consumer.subscribe({ topic: "send-mail", fromBeginning: false });

//     log("Consumer", "✅ Mail consumer started");

//     const { user, pass } = getMailCredentials();

//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: { user, pass },
//     });

//     await consumer.run({
//       autoCommit: false,
//       eachMessage: async ({ topic, partition, message, heartbeat }) => {
//         const raw = message.value?.toString();
//         log(
//           "Consumer",
//           `📥 ${topic} | partition ${partition} | offset ${message.offset}`
//         );

//         if (!raw) return;

//         try {
//           const { to, subject, html } = JSON.parse(raw);

//           if (!to || !subject) throw new Error("Invalid mail payload");

//           await transporter.sendMail({
//             from: `"HireHub" <${user}>`,
//             to,
//             subject,
//             html,
//           });

//           log("Mail", `📨 Sent to ${to}`);
//         } catch (err) {
//           console.error("❌ Mail send failed:", err);
//           throw err; // Kafka will retry
//         }
//       },
//     });
//   } catch (err) {
//     console.error("❌ Failed to start consumer", err);
//     throw err;
//   }
// };

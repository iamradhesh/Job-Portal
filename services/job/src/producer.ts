import { Kafka, type Admin, type Producer } from "kafkajs";
import fs from "fs";
import path from "path";

// ✅ Use lowercase variable names for instances
let producer: Producer;
let admin: Admin;

// Helper to read cert files
const cert = (file: string) => {
  if (!process.env.KAFKA_CERTS_PATH) {
    throw new Error("❌ KAFKA_CERTS_PATH is not defined in .env");
  }
  const filePath = path.resolve(process.env.KAFKA_CERTS_PATH, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Cert file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
};

export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: "auth-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],

      // 🔐 Aiven mTLS configuration
      ssl: {
        rejectUnauthorized: true,
        ca: [cert("ca.pem")],
        cert: cert("service.cert"),
        key: cert("service.key"),
      },
    });

    // ---------- ADMIN ----------
    admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();

    if (!topics.includes("send-mail")) {
      await admin.createTopics({
        topics: [
          {
            topic: "send-mail",
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log("✅ Topic 'send-mail' created");
    }

    await admin.disconnect();

    // ---------- PRODUCER ----------
    producer = kafka.producer();
    await producer.connect();

    console.log("✅ Connected to Kafka Producer");
  } catch (error) {
    console.error("❌ Failed to connect to Kafka", error);
  }
};

export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    console.log("❌ Kafka producer is not initialized");
    return;
  }

  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log("✅ Message published to topic:", topic);
  } catch (error) {
    console.error("❌ Error publishing to topic:", error);
  }
};

export const disconnectKafka = async () => {
  if (producer) {
    await producer.disconnect();
  }
};

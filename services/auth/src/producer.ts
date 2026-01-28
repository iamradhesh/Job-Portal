// services/auth/kafka.ts
import 'dotenv/config';
import { Kafka, type Producer, type Admin, logLevel } from 'kafkajs';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// ---------------- Globals ----------------
let producer: Producer;
let admin: Admin;

// ---------------- Logging helper ----------------
const log = (prefix: string, ...args: any[]) => console.log(`[${prefix}]`, ...args);

// ---------------- Helper to read cert files ----------------
const cert = (file: string) => {
  const certPath = process.env.KAFKA_CERTS_PATH;
  if (!certPath) throw new Error('❌ KAFKA_CERTS_PATH is not defined in .env');
  const filePath = path.resolve(certPath, file);
  if (!fs.existsSync(filePath)) throw new Error(`❌ Cert file not found: ${filePath}`);
  return fs.readFileSync(filePath, 'utf-8');
};

// ---------------- Validate Gmail credentials ----------------
const getMailCredentials = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!user || !pass) throw new Error('❌ MAIL_USER or MAIL_PASS missing in .env (use App Password)');
  return { user, pass };
};

// ---------------- Connect Kafka ----------------
export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: 'auth-service',
      brokers: [process.env.KAFKA_BROKER!],
      ssl: {
        rejectUnauthorized: true,
        ca: [cert('ca.pem')],
        cert: cert('service.cert'),
        key: cert('service.key'),
      },
      logLevel: logLevel.INFO,
    });

    // ---------- ADMIN ----------
    admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    log('Kafka', 'Existing topics:', topics);

    if (!topics.includes('send-mail')) {
      await admin.createTopics({
        topics: [{ topic: 'send-mail', numPartitions: 1, replicationFactor: 1 }],
      });
      log('Kafka', "✅ Topic 'send-mail' created");
    }

    await admin.disconnect();

    // ---------- PRODUCER ----------
    producer = kafka.producer({ allowAutoTopicCreation: false });
    await producer.connect();
    log('Kafka', '✅ Connected to Kafka Producer');
  } catch (err) {
    console.error('❌ Failed to connect to Kafka', err);
    throw err;
  }
};

// ---------------- Publish to Kafka ----------------
export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    console.log('❌ Kafka producer not initialized');
    return;
  }
  try {
    log('Producer', `📤 Publishing message to ${topic}:`, message);
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
      acks: -1, // wait for leader + ISR to commit
    });
    log('Producer', `✅ Message successfully published to ${topic}`);
  } catch (err) {
    console.error('❌ Error publishing to topic:', err);
  }
};

// ---------------- Disconnect Kafka ----------------
export const disconnectKafka = async () => {
  if (producer) {
    await producer.disconnect();
    log('Kafka', '✅ Kafka producer disconnected');
  }
};

// ---------------- Kafka Mail Consumer ----------------
export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: 'mail-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      ssl: {
        rejectUnauthorized: true,
        ca: [cert('ca.pem')],
        cert: cert('service.cert'),
        key: cert('service.key'),
      },
      logLevel: logLevel.INFO,
    });

    const consumer = kafka.consumer({ groupId: 'mail-service-group' });
    await consumer.connect();
    const topicName = 'send-mail';
    await consumer.subscribe({ topic: topicName, fromBeginning: true }); // for testing; switch to false in prod

    log('Consumer', '✅ Mail Service Consumer Started');

    const { user, pass } = getMailCredentials();

    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const rawValue = message.value?.toString();
        log('Consumer', `📥 Received message on topic "${topic}", partition ${partition}, offset ${message.offset}:`, rawValue);

        try {
          const data = JSON.parse(rawValue || '{}');
          const { to, subject, html } = data;

          if (!to || !subject) {
            log('Consumer', '❌ Invalid email payload:', data);
            return;
          }

          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
          });

          await transporter.sendMail({ from: `"HireHub" <${user}>`, to, subject, html });
          log('Consumer', `📨 Mail successfully sent to ${to}`);
        } catch (err) {
          console.error('❌ Failed to send mail', err);
        }
      },
    });
  } catch (err) {
    console.error('❌ Failed to start Kafka consumer', err);
  }
};

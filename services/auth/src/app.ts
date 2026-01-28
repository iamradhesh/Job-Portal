//services/auth/src/app.ts
import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.js';
import { connectKafka } from './producer.js';
import cors from 'cors'
const app = express();

// Middleware FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
// Connect Kafka ONCE
await connectKafka();

// Routes
app.use('/api/auth', authRoutes);

export default app;

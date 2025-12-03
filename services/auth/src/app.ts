import express from 'express';
import authRoutes from './routes/auth.js';
import { connectKafka } from './producer.js';

const app = express();

// Middleware FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Kafka ONCE
connectKafka();

// Routes
app.use('/api/auth', authRoutes);

export default app;

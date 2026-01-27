import app from './app.js';
import dotenv from 'dotenv';
import { sql } from './utils/db.js';
import {createClient} from 'redis'
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});

redisClient.connect().then(()=>console.log("✅ Connected to Redis")).catch(console.error);

async function initDB() {
  try {
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
          CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter'); 
        END IF; 
      END 
      $$;
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        role user_role NOT NULL,
        bio TEXT,
        resume VARCHAR(255),
        resume_public_id VARCHAR(255),
        profile_pic VARCHAR(255),
        profile_pic_public_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subscription TIMESTAMPTZ
      );
    `;
    await sql `
    CREATE TABLE IF NOT EXISTS skills(
      skill_id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    )`;
    await sql`
    CREATE TABLE IF NOT EXISTS user_skills(
      user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      skill_id INT NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, skill_id)
    )`;
    await sql `
    CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,
    
    -- Razorpay references
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),

    -- Business data
    amount INT NOT NULL,               -- in paise (e.g. 11900)
    currency VARCHAR(10) DEFAULT 'INR',
    purpose VARCHAR(50) DEFAULT 'subscription',

    -- Payment state
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('created', 'paid', 'failed', 'refunded')
    ),

    -- Subscription info
    subscription_days INT DEFAULT 30,
    subscription_expiry TIMESTAMP,

    -- Raw gateway response (for audit/debug)
    gateway_response JSONB,

    -- Security & tracking
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

    `
    console.log('✅ Database initialized successfully.');
  } catch (error) {
    console.error('❌ DB init error:', error);
    process.exit(1);
  }
}

initDB().then(()=>{
  app.listen(process.env.PORT, () => {
    console.log(`Auth service is running on port ${process.env.PORT}`);
});
});



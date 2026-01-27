import express from 'express';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import cors from 'cors';
import paymentRoutes from "./routes/payment.js"
dotenv.config();

export const instance = new Razorpay({
    key_id: process.env.Razorpay_Key!,
    key_secret:process.env.RAZORPAY_SECRET!
});

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api/payment",paymentRoutes);

app.listen(process.env.PORT,()=>{
    console.log("✅💲Payment Service Is Listening on Port:",process.env.PORT);

})


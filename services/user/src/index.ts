import express from 'express'
import dotenv from 'dotenv';
import userRoutes from './routes/user.js'
dotenv.config();
const app = express();

app.use(express.json());

app.use('/api/user',userRoutes);

app.listen(process.env.PORT,()=>{
    console.log('✅ User Service is Running at PORT:',process.env.PORT);
})
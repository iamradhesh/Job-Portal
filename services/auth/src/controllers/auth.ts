import { TryCatch } from '../utils/TryCatch.js';
import ErrorHandler from '../utils/errorHandler.js';
import { sql } from '../utils/db.js';
import bcrypt from 'bcrypt'
export const registerUser = TryCatch(async (req,res,next) => {
    // Your registration logic here
    const {name,email,password,phoneNumber,role,bio} = req.body;
    if(!name || !email || !password || !phoneNumber || !role){
        throw new ErrorHandler(400,'All fields are required except bio');
    }

    const existingUsers = await sql`SELECT user_id FROM users WHERE email = ${email}`;
    if(existingUsers.length > 0){
        throw new ErrorHandler(409,'User with this email already exists Please login!');
    }
    const hashPassword = await bcrypt.hash(password, 10); 
    let registerUser;
    if(role==='recruiter'){
        const [user] = await sql`INSERT INTO users (name, email, password, phone_number, role) VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}) RETURNING user_id,name,email,phone_number,role,created_at`;
    }
    res.json(email);
});
import express from 'express';
import { isAuth } from '../middleware/auth.js';
import { getUserProfileById, myProfile, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/me',isAuth,myProfile);
router.get("/:userId",isAuth,getUserProfileById);
router.put('/update/profile',isAuth,updateUserProfile);

export default router;
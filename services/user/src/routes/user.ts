import express from 'express';
import { isAuth } from '../middleware/auth.js';
import { addSkillToUser, applyForJob, getApplicantsForJob, getUserProfileById, myProfile, removeSkillFromUser, updateProfilePicture, updateResume, updateUserProfile } from '../controllers/userController.js';
import uploadFile from '../middleware/multer.js';
const router = express.Router();

router.get('/me',isAuth,myProfile);
router.get("/:userId",isAuth,getUserProfileById);

router.put('/update/profile',isAuth,updateUserProfile);
router.put('/update/profile-picture',isAuth,uploadFile,updateProfilePicture);
router.put('/update/resume',isAuth,uploadFile,updateResume);
router.post('/skill/add',isAuth,addSkillToUser);
router.delete('/skill/delete',isAuth,removeSkillFromUser);
router.post('/apply/job',isAuth,applyForJob);
router.get('/application/all',isAuth,getApplicantsForJob);
export default router;
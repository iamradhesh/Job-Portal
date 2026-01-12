import express from 'express';
import { isAuth } from '../middleware/auth.js';
import uploadFile from '../middleware/multer.js';
import { createCompany, createJob, deleteCompany, deleteJobs, getAllActiveJobs, getAllApplicationsForJob, getAllCompanies, getCompanyDetails, getSingleJob, updateApplication, updateJob } from '../controllers/jobController.js';

const router = express.Router();

router.post('/company/new',isAuth,uploadFile,createCompany);
router.delete("/company/:companyId",isAuth,deleteCompany);
router.post("/new",isAuth,createJob);
router.put("/update/:jobId", isAuth,updateJob);
router.delete("/delete/:jobId", isAuth,deleteJobs);
router.delete("/company/:companyId",isAuth,deleteCompany);
router.get("/company/all",isAuth,getAllCompanies);
router.get("/company/:id",getCompanyDetails);
router.get("/active-jobs",isAuth,getAllActiveJobs);
router.get("/:jobId",getSingleJob);
router.get("/application/:jobId", isAuth,getAllApplicationsForJob);
router.put("/application/update/:applicationId",isAuth,updateApplication);

export default router;
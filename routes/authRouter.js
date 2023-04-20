import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verify.js";
import authController from "../controllers/authController.js";

router.post('/signup', authController.signup)

router.post('/signin', authController.signIn)

router.get('/me', verifyToken, authController.getMe)

export default router;
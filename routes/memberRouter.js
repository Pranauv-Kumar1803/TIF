import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verify.js";
import memberController from "../controllers/memberController.js";

router.post('/', verifyToken, memberController.postMember)

router.delete('/:id', verifyToken, memberController.postMember)

export default router;
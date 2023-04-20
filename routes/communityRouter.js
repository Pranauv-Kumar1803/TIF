import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verify.js";
import communityController from "../controllers/communityController.js";

router.get('/', communityController.getCommunity)

router.get('/:page', communityController.getCommunityWithPage)

router.get('/:id/members', communityController.getMember)

router.get('/:id/members/:page', communityController.getMemberWithPage)

router.get('/me/owner', verifyToken, communityController.getCommunityOwned)

router.get('/me/owner/:page', verifyToken, communityController.getCommunityOwnedWithPage)

router.get('/me/member', verifyToken, communityController.getCommunityMember)

router.get('/me/member/:page', verifyToken, communityController.getCommunityMemberWithPage)

router.post('/', verifyToken, communityController.postCommunity)

export default router;
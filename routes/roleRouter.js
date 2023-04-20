import express from "express";
const router = express.Router();
import Role from "../models/Role.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import roleController from "../controllers/roleController.js";

router.get('/', roleController.getRoles);

router.get('/:page', roleController.getRolesWithPage);

router.post('/', roleController.postRoles);

export default router;
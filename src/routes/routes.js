import express from "express";
import { storeUser, loginUser } from "../controller/authController.js";

const router = express.Router();

router.post("/", storeUser);
router.post("/login", loginUser);

export default router

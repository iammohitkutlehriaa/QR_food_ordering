import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { createPayment, verifyPayment } from "../controllers/payment.js";



const router = express.Router();

router.post("/create",authenticate, createPayment);
router.post("/verify", authenticate,verifyPayment);

export default router;
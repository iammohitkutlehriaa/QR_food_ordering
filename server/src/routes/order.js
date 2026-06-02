import express from "express";
import { getOrders, placeOrder, updateOrderStatus } from "../controllers/order.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router()


router.post("/",placeOrder);
router.get("/",authenticate, authorize("admin"), getOrders);
router.put("/:id",authenticate , authorize("admin","kitchen"),updateOrderStatus)

export default router;  
import express from "express";
import { register,login , logout , createKitchenUser } from "../controllers/auth.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",login);
router.post("/logout",logout);
router.post("/kitchen", authenticate, authorize("admin"), createKitchenUser);

router.get("/me" ,authenticate, (req, res) => {
    res.json({success: true, data: req.user});
})

export default router;
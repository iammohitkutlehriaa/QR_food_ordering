import express from "express";
import { register,login , logout } from "../controllers/auth.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",login);
router.post("/logout",logout);

router.get("/me" ,authenticate, (req, res) => {
    res.json({success: true, data: req.user});
})

export default router;
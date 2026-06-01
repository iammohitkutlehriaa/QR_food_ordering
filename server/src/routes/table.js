import express from "express";
import { createTable, getTables, verifyTable } from "../controllers/table.js"
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();


router.post("/", authenticate,authorize("admin"),createTable);
router.get("/",authenticate, authorize("admin"), getTables);
router.get("/verify/:token",verifyTable);


export default router;
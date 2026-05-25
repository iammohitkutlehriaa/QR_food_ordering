import express from "express";
import {
    createMenuItem,
    getMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from "../controllers/menuItem.js";
import { authenticate , authorize } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { updateCategory } from "../controllers/category.js";


const router = express.Router();

router.post("/", authenticate ,authorize("admin"), upload.single("image"),createMenuItem);
router.get("/", authenticate ,authorize("admin"), getMenuItem);
router.put("/:id", authenticate ,authorize("admin"), upload.single("image"),updateMenuItem);
router.delete("/:id", authenticate ,authorize("admin"), deleteMenuItem);

export default router;
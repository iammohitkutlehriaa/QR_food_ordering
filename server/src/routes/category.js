import express from "express";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
} from "../controllers/category.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";


const router = express.Router();

router.post("/", authenticate, authorize("admin"), upload.single("image"),createCategory);
router.get("/", authenticate, authorize("admin"), getCategories);
router.put("/:id", authenticate, authorize("admin"), upload.single("image"), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

export default router;
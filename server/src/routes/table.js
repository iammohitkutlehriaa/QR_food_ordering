import express from "express";
import {
  createTable,
  getTables,
  verifyTable,
  updateTable,
  deleteTable,
  regenerateQr,
} from "../controllers/table.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticate, authorize("admin"), createTable);
router.get("/", authenticate, authorize("admin"), getTables);
router.get("/verify/:token", verifyTable);
router.patch("/:id", authenticate, authorize("admin"), updateTable);
router.delete("/:id", authenticate, authorize("admin"), deleteTable);
router.post("/:id/regenerate-qr", authenticate, authorize("admin"), regenerateQr);

export default router;
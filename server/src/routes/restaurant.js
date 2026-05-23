import express from "express";
import {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
} from "../controllers/restaurant.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("logo"),
  createRestaurant,
);

router.get("/me", authenticate, authorize("admin"), getMyRestaurant);

router.put(
  "/me",
  authenticate,
  authorize("admin"),
  upload.single("logo"),
  updateRestaurant,
);

export default router;

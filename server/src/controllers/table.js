import Table from "../models/table.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { v4 as uuidv4 } from "uuid";
import Restaurant from "../models/restaurant.js";
import QrCode from "qrcode";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// create  table
const createTable = async (req, res, next) => {
  console.log("BODY", req.body);
  try {
    const { tableNumber } = req.body;
    if (!tableNumber) {
      throw new apiError(400, "Table number is required");
    }
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "admin not found");
    }
    const qrToken = uuidv4();
    const qrUrl = `{$process.env.CLIENT_URL}/menu?token=${qrToken}`;
    const qrImageBuffer = await QrCode.toBuffer(qrUrl);
    const result = await uploadToCloudinary(qrImageBuffer, "qr-codes");
    const qrCode = result.secure_url;
    const table = await Table.create({
      tableNumber,
      restaurantId: restaurant._id,
      qrToken,
      qrCode,
    });
    return res
      .status(201)
      .json(new apiResponse(201, table, "table is created succesfully.."));
  } catch (err) {
    next(err);
  }
};

// get my table

const getTables = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    const tables = await Table.find({ restaurantId: restaurant._id });

    return res
      .status(200)
      .json(new apiResponse(200, tables, "Table is fetched successfully"));
  } catch (err) {
    next(err);
  }
};

export { createTable, getTables };

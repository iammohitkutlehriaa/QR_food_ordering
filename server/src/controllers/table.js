import Table from "../models/table.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { v4 as uuidv4 } from "uuid";
import Restaurant from "../models/restaurant.js";
import QrCode from "qrcode";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// create  table
const createTable = async (req, res, next) => {
  try {
    const { tableNumber } = req.body;
    if (!tableNumber) {
      throw new apiError(400, "Table number is required");
    }
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }

    const exists = await Table.findOne({
      restaurantId: restaurant._id,
      tableNumber,
    });
    if (exists) {
      throw new apiError(409, "Table number already exists");
    }

    const qrToken = uuidv4();
    const qrUrl = `${process.env.CLIENT_URL}/menu?token=${qrToken}`;
    const qrImageBuffer = await QrCode.toBuffer(qrUrl);
    const result = await uploadToCloudinary(qrImageBuffer, "qr-codes");

    const table = await Table.create({
      tableNumber,
      restaurantId: restaurant._id,
      qrToken,
      qrCode: result.secure_url,
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

const verifyTable = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      throw new apiError(400, "Token is required");
    }
    const table = await Table.findOne({ qrToken: token });
    if (!table || !table.isActive) {
      throw new apiError(404, "Table is not found");
    }
    const restaurant = await Restaurant.findById(table.restaurantId).select(
      "name logo",
    );
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    return res
      .status(200)
      .json(new apiResponse(200, { table, restaurant }, "Table verified successfully"));
  } catch (err) {
    next(err);
  }
};

const updateTable = async(req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({owner:req.user._id});
    if(!restaurant) {
      throw apiError(404, "Restaurant is not found");
    }
    const {isActive} = req.body;
    if(typeof isActive !== "boolean") {
      throw new apiError(400 , "isActive must be true or false");
    }
    const table = await Table.findOne({
      _id:req.params.id,
      restaurantId: restaurant._id,
    });
    if(!table) {
      throw new apiError(404, "Table is not found");
    }
    table.isActive = isActive;
    await table.save();
    return res.status(200).json(new apiResponse(200 , table , "Table updated successfully"));
  } catch(err) {
    next(err);
  }
};

const deleteTable = async(req,res ,next) => {
  try {
    const restaurant = await Restaurant.findOne({owner: req.user._id});
    if(!restaurant) {
      throw new apiError(404 , "Restaurant is not found");
    }
    const table = await Table.findOneAndDelete({
      _id:req.params.id,
      restaurantId: restaurant._id,
    });
    if(!table) {
      throw new apiError(404, "Table is not found");
    } return res.status(200).json(new apiResponse(200 , {} , "table deleted successfully"));
  } catch(err) {
    next(err)
  }
};

const regenerateQr = async(req, res, next) => {
  try{
    const restaurant = await Restaurant.findOne({owner: req.user._id});
    if(!restaurant) {
      throw new apiError(404, "restaurnat is not found");
    } 
    const table = await Table.findOne({
      _id:req.params.id,
      restaurantId: restaurant._id,
    });
    if(!table) {
      throw new apiError(404,"table not found");
    }
    const qrToken = uuidv4();
    const qrUrl = `${process.env.CLIENT_URL}/menu?token=${qrToken}`;
    const qrImageBuffer = await QrCode.toBuffer(qrUrl);
    const result = await uploadToCloudinary(qrImageBuffer, "qr-codes");

    table.qrToken = qrToken;
    table.qrCode = result.secure_url;
    await table.save();

    return res.status(200).json(new apiResponse(200 ,table, "QR regenrate sucessfully"));
  } catch(err) {
    next(err);
  }
};

export { createTable, getTables , verifyTable , updateTable , deleteTable, regenerateQr};

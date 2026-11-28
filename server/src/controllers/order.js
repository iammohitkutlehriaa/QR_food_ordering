import Order from "../models/order.js";
import Restaurant from "../models/restaurant.js";
import Table from "../models/table.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
import MenuItem from "../models/menuItem.js";
import { emitOrderEvent } from "../socket.js";

const placeOrder = async (req, res, next) => {
  try {
    const { tableId, customerName, items, idempotencyKey } = req.body;

    if (!tableId || !mongoose.isValidObjectId(tableId)) {
      throw new apiError(400, "Valid tableId is required");
    }
    if (!customerName || !customerName.trim()) {
      throw new apiError(400, "Customer name is required");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new apiError(400, "Order must have at least one item");
    }
    if(idempotencyKey) {
      const existing = await Order.findOne({idempotencyKey});
      if(existing) {
        return res
        .status(200)
        .json(new apiResponse(200 , existing , "Order already created."));
      }
    }

    const table = await Table.findById(tableId);
    if (!table || !table.isActive) {
      throw new apiError(404, "table not found");
    }

    const qtyById = new Map();
    for (const it of items) {
      const quantity = Number(it.quantity);
      if (
        !it.menuItemId ||
        !mongoose.isValidObjectId(it.menuItemId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        throw new apiError(400, "Invalid item in order");
      }
      const key = String(it.menuItemId);
      qtyById.set(key, (qtyById.get(key) || 0) + quantity);
    }

    const ids = [...qtyById.keys()];
    const menuItems = await MenuItem.find({
      _id: { $in: ids },
      restaurantId: table.restaurantId,
      isAvailable: true,
    });
    if (menuItems.length !== ids.length) {
      throw new apiError(400, "Some items are unavailable for this restaurant");
    }

    let totalAmount = 0;
    const orderItems = menuItems.map((m) => {
      const quantity = qtyById.get(String(m._id));
      totalAmount += m.price * quantity;
      return {
        menuItemId: m._id,
        name: m.name,
        price: m.price,
        quantity,
      };
    });

    let createOrder;
    try {
      createOrder = await Order.create({
        tableId,
        tableNumber: table.tableNumber,
        restaurantId : table.restaurantId,
        customerName: customerName.trim(),
        items: orderItems,
        totalAmount,
        idempotencyKey: idempotencyKey || undefined,
      });
    } catch( err) {
      if(err.code === 11000 && idempotencyKey) {
        const existing = await Order.findOne({idempotencyKey});
        return res
        .status(200)
        .json(new apiResponse(200, existing, "Order already created."));
      } 
      throw err;
    }
    emitOrderEvent("order:new", createOrder);
    return res
      .status(201)
      .json(new apiResponse(201, createOrder, "Order created successfully.."));
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { restaurantId: restaurant._id };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("items.menuItemId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json(
      new apiResponse(
        200,
        { orders, total, page, totalPages: Math.ceil(total / limit) },
        "Order fetched sucessfully...",
      ),
    );
  } catch (err) {
    next(err);
  }
};

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new apiError(400, "Invalid order id");
    }
    if (!status) {
      throw new apiError(400, "status  is required");
    }

    let restaurantId = req.user.restaurantId;
    if (!restaurantId) {
      const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
      restaurantId = restaurant?._id;
    }
    if (!restaurantId) {
      throw new apiError(404, "Restaurant is not found");
    }

    const order = await Order.findOne({ _id: id, restaurantId });
    if (!order) {
      throw new apiError(404, "order is not found");
    }

    if (NEXT_STATUS[order.status] !== status) {
      throw new apiError(409, `Cannot change status from ${order.status} to ${status}`);
    }

    const updated = await Order.findOneAndUpdate(
      { _id: id, status: order.status },
      { status },
      { new: true },
    );
    if (!updated) {
      throw new apiError(409, "Order was just updated by someone else. Please refresh.");
    }

    emitOrderEvent("order:updated", updated);
    return res
      .status(200)
      .json(new apiResponse(200, updated, "Order status updated succesfully"));
  } catch (err) {
    next(err);
  }
};


const getOrderById = async(req,res,next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
    .populate("restaurantId", "name")
    .populate("items.menuItemId", "name price")
    if(!order) {
      throw new apiError(404, "Order not found")
    }
    return res.status(200).json(
    new apiResponse(200, order, "Order fetched successfully")
  );
  } 
  catch(err) {
    next(err)
  }
};

const getKitchenOrders = async (req,res,next) => {
  try {
    if(!req.user.restaurantId) {
      throw new apiError(404, "No restaurant assinged to this user");
    }
    const orders = await Order.find({
      restaurantId: req.user.restaurantId,

      status: {$in:["pending", "confirmed", "preparing","ready"]},
    })
    .populate("items.menuItemId" , "name").sort({createdAt:1});
    return res.status(200).json(new apiResponse(200, orders, "Kitchen order fetched sucessfully"));
  }
  catch(err) {
    next(err);
  }
};


export {placeOrder, getOrders, updateOrderStatus, getOrderById, getKitchenOrders}

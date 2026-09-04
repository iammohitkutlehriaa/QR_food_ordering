import Order from "../models/order.js";
import Restaurant from "../models/restaurant.js";
import Table from "../models/table.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const placeOrder = async (req, res, next) => {
  try {
    const { tableId, customerName, items , totalAmount} = req.body;
    if (!tableId || !items) {
      throw new apiError(403, "tableId , customerName is required");
    }
    const table = await Table.findOne({ _id: tableId });
    if (!table) {
      throw new apiError(404, "table not found");
    }
    const createOrder = await Order.create({
      tableId,
      tableNumber: table.tableNumber,
      restaurantId: table.restaurantId,
      customerName,
      items,
      totalAmount,
    });
    return res
      .status(201)
      .json(new apiResponse(201, createOrder, "Order created successfully.."));
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req,res,next) => {
  try{
  const restaurant = await Restaurant.findOne({owner: req.user._id});
  if(!restaurant ) {
    throw new apiError(404,"Restaurant is not found");
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const orders = await Order.find({restaurantId: restaurant._id})
  .limit(limit)
  .skip(skip)
  return res.status(200).json(
    new apiResponse(200, orders, "Order fetched sucessfully...")
  )
  }
  catch(err){
    next(err);
  }
};

const updateOrderStatus = async (req,res,next) => {
  
  try{
    const { id } = req.params;
     const { status } = req.body;

    if(!status) {
      throw new apiError(400, "status  is required")
    }
   
    const order =  await Order.findById(id)
    if(!order) {
      throw new apiError(404, "order is not found")
    }
    order.status = status;
    await order.save();
    return res.status(200).json(
    new apiResponse(200, order, "Order status updated succesfully")
  )
  }
  catch(err) {
    next(err)
  }
}


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
}

const getKitchenOrders = async (req,res,next) => {
  try {
    const restaurant = await Restaurant.findOne({owner: req.user._id})
    if(!restaurant){
      throw new apiError(404, "Restaurant is not found")
    }
    const orders = await Order.find({
      restaurantId: restaurant._id,
      status: {$in: ["pending", "confirmed", "preparing"]}
    }).sort({createdAt: 1})
    return res.status(200).json(
    new apiResponse(200, orders, "Kitchen order fetched sucessfully...")
  )
  }
  catch(err) {
    next(err)
  }
}


export {placeOrder, getOrders, updateOrderStatus, getOrderById, getKitchenOrders}

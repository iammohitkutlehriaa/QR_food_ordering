import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import razorpay from "../config/razorpay.js";   
import { emitOrderEvent } from "../socket.js";


    const createPayment  = async(req, res , next) => {
        try {
            const {orderId} = req.body;
            if(!orderId || !mongoose.isValidObjectId(orderId)) {
                throw new apiError(400 , "valid OrderId is required");
            }
        const order = await Order.findById(orderId);
        if(!order) {
            throw new apiError(404 , "Order not found");
        } 
        if(order.paymentStatus === "paid") {
            throw new apiError(404, "Order is already paid");
        }
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency : "INR",
            receipt :String(order._id),
        })
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json(
            new apiResponse(200,{
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
            },
        "Payment created SuccessFully"),
        );
    } catch(err) {
        next(err);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const  {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = req.body;
        if(
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !orderId
        ) {
            throw new apiError(400, "Missing payment details"); 
        }
        const order = await Order.findById(orderId);
        if(!order) {
            throw new apiError(404, "Order not found");
        }
        if(order.razorpayOrderId !== razorpay_order_id) {
            throw new apiError(400 ,  "Payment does not match this order");
        }
        if(order.paymentStatus === "paid") {
            return res
            .status(200)
            .json(new apiResponse(200 , order , "Payment already verified"));
        }

        const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
        const a = Buffer.from(expected);
        const b = Buffer.from(String(razorpay_signature));
        const isValid  = a.length === b.length && crypto.timingSafeEqual(a,b);
        if(!isValid) {
            throw new apiError(400, "Invalid payment signature");
        }
        order.paymentStatus = "paid";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
        emitOrderEvent("order:updated", order);

        return res
        .status(200)
        .json(new apiResponse(200 , order , "Payment verified sucessfully"));
    } catch(err) {
        next(err)
    }
};

export{createPayment , verifyPayment};

import Order from "../models/order.js";
import apiError from "../utils/apiError.js";
import razorpay from "../config/razorpay.js";
import apiResponse from "../utils/apiResponse.js";
import crypto from "crypto";



const createPayment = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId)
        if(!order) {
            throw new apiError(404, "Order not found")
        }
        const razorpayOrder = await razorpay.orders.create({

            amount: order.totalAmount * 100,
            currency: "INR",
            receipt: orderId,
        })
        return res.status(200).json(
            new apiResponse(200, razorpayOrder, "payment created sucessfully")
        )
    }
    catch(err) {
        next(err)
    }
};

const verifyPayment = async (req,res ,next) => {
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId} = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
    const isValid = expectedSignature === razorpay_signature;  
    if(isValid) {
        await Order.findOneAndUpdate(
            {_id: req.body.orderId},
            {
                paymentStatus: "Paid"
            }
        )
    return res.status(200).json(
        new apiResponse(200, "payment sucessfully done......")
    )
    }
    throw new apiError(400, "Invalid payment signature")
    
    
    }
    catch(err) {
        next(err)
    }
}

export { createPayment, verifyPayment}
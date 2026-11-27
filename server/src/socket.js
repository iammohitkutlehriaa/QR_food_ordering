import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/user.js";
import Restaurant from "./models/restaurant.js";
import Order from "./models/order.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Staff login check. Customers bina token ke connect ho sakte hain.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user || !user.isActive) return next(new Error("unauthorized"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    // Customer: sirf apne order ka room join karta hai
    socket.on("order:join", async (orderId) => {
      try {
        if (!mongoose.isValidObjectId(orderId)) return;
        const exists = await Order.exists({ _id: orderId });
        if (exists) socket.join(`order:${orderId}`);
      } catch (err) {
        console.error("order:join error:", err.message);
      }
    });

    // Staff: apne restaurant ka room join karta hai
    try {
      if (socket.user && ["admin", "kitchen"].includes(socket.user.role)) {
        let restaurantId = socket.user.restaurantId;
        if (!restaurantId) {
          const r = await Restaurant.findOne({ owner: socket.user._id }).select("_id");
          restaurantId = r?._id;
        }
        if (restaurantId) socket.join(`restaurant:${restaurantId}`);
      }
    } catch (err) {
      console.error("staff join error:", err.message);
    }
  });

  return io;
};

export const emitOrderEvent = (event, order) => {
  if (!io || !order) return;
  io.to(`restaurant:${order.restaurantId}`)
    .to(`order:${order._id}`)
    .emit(event, {
      orderId: String(order._id),
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
};
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Types.ObjectId,
      ref: "Restaurant",
    },
    tableId: {
      type: mongoose.Types.ObjectId,
      ref: "Table",
    },
    tableNumber: {
      type: Number,
    },
    customerName: {
      type: String,
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Types.ObjectId,
          ref: "MenuItem",
        },
          name: {
            type: String,
          },
          price: {
            type: Number,
          },
          quantity: {
            type: Number,
          },
        },
    ],
    status: {
        type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "served", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
    },
    paymentStatus: {
        type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true });
  orderSchema.index({restaurantId: 1, status: 1}),
  orderSchema.index({tableId: 1});


const Order = mongoose.model("Order", orderSchema);
export default Order;

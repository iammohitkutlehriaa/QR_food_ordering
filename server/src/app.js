import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.js";
import authRoutes from "./routes/auth.js";
import restaurantRoutes from "./routes/restaurant.js";
import categoryRoutes from "./routes/category.js"
import MenuItemRoutes from "./routes/menuItem.js";
import tableRoutes from "./routes/table.js"
import orderRoutes from "./routes/order.js";
import paymentRouter from "./routes/payment.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(cookieParser());
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/restaurants",restaurantRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/menu-items", MenuItemRoutes);
app.use("/api/v1/tables",tableRoutes);
app.use("/api/v1/orders",orderRoutes);
app.use("/api/v1/payments", paymentRouter)

app.use(errorHandler);

// test route
app.get("/api/v1/health",(req,res) => {
    res.json({status: "OK 👍",message : "server is running"});
});

export default app;
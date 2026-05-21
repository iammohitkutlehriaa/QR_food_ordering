import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.js";
import authRoutes from "./routes/auth.js"

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "https://localhost:5173",
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(cookieParser());
app.use("/api/v1/auth",authRoutes);
app.use(errorHandler);

// test route
app.get("/api/v1/health",(req,res) => {
    res.json({status: "OK 👍",message : "server is running"});
});

export default app;
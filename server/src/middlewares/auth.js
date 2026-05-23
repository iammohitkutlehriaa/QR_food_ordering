import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";
import User from "../models/user.js";

const authenticate = async (req,res,next) => {
    try {const  authHeader = req.headers.authorization;
        const token  = req.cookies?.token ||(authHeader && authHeader.startsWith("Bearer")
    ? authHeader.split(" ")[1]: null);
    console.log("TOKEN",token)
        if(!token) {
            throw new apiError(401,"Unauthorized - please login");
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            throw new apiError(401, "user not found")
        }
        req.user = user;
        next();
    } catch(err) {
        next(err);
    }
};

const authorize = (...roles) => {
    return(req ,res, next) => {
        if(!roles.includes(req.user.role)){
            throw new apiError(403, "You dont have permission")
        }
        next();
    }
}

export {authenticate , authorize};
import User from "../models/user.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import generatetoken from "../utils/generateToken.js";
import Restaurant from "../models/restaurant.js";

// register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new apiError(400, "All fields  are required!");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new apiError(409, "User already existing with this email");
    }
    const user = await User.create({ name, email, password, role : "admin"});

    generatetoken(res, user._id, user.role);
    return res.status(201).json(
      new apiResponse(
        201,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        "User resgisterd successfully",
      ),
    );
  } catch (err) {
    next(err);
  }
};

//login
const login = async(req,res,next) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            throw new apiError(400, "Email and password are required");
        }
        const user = await User.findOne({email});
        if(!user){
            throw new apiError(401, "Invalid email and password!")
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            throw new apiError(401, "Invalid email and password!")
        }
        const token = generatetoken(res,user._id, user.role);
        return res.status(200).json(
            new apiResponse(200, {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,token
            },"Login successfull!!")
        );
    } catch(err){
    next(err)
    }
};

//Logout
const logout = async(req,res,next) => {
    res.cookie("token", "", {maxAge: 0});
    return res.status(200).json(
        new apiResponse(200, {},"Logged out successfully")
    );
};


const createKitchenUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new apiError(400, "All fields are required!");
    }
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
  
    if (!restaurant) {
      throw new apiError(404, "Create your restaurant first");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new apiError(409, "User already existing with this email");
    }
    const user = await User.create({
      name,
      email,
      password,
      role: "kitchen",
      restaurantId: restaurant._id,
    });
    console.log("E: created");
    return res.status(201).json(
      new apiResponse(
        201,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
        },
        "Kitchen user created successfully",
      ),
    );
  } catch (err) {
    next(err);
  }
};

export {register ,login , logout , createKitchenUser}

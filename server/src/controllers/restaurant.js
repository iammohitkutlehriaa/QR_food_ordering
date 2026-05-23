import Restaurant from "../models/restaurant.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// create restaurant
const createRestaurant = async (req, res, next) => {
  try {
    const { name, address, settings } = req.body;
    if (!name) {
      throw new apiError(400, "restaurnat name is required");
    }
    // slug genrate form name
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    //slug already exist..
    const existing = await Restaurant.findOne({ slug });
    if (existing) {
      throw new apiError(409, "Restaurant is alresdy exist");
    }
    // logo upload if given..
    let logoUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "logos");
      logoUrl = result.secure_url;
    }
    const restaurant = await Restaurant.create({
      name,
      slug,
      logo: logoUrl,
      settings: settings ? JSON.parse(settings) : {},
      owner: req.user._id,
    });
    return res
      .status(201)
      .json(new apiResponse(201, restaurant), "Restaurant created sucessfully");
  } catch (err) {
    next(err);
  }
};
  //Get my restaurant
  const getMyRestaurant = async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        throw new apiError(404, "Restaurant not found");
      }
      return res
        .status(200)
        .json(
          new apiResponse(200, restaurant, "restaurant fetched succesfully!!"),
        );
    } catch (err) {
      next(err);
    }
  };

  // Update restaurant....
  const updateRestaurant = async (req, res, next) => {
    try {
      const { name, address, settings } = req.body;

      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        throw new apiError(404, "Restaurant is not found..");
      }
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, "logos");
        restaurant.logo = result.secure_url;
      }
      if (name) {
        restaurant.name = name;
        restaurant.slug = name.toLowerCase().trim().replace(/\s+/g, "-");
      }
      if (address) restaurant.address = address;
      if (settings) restaurant.settings = JSON.parse(settings);

      await restaurant.save();

      return res
        .status(200)
        .json(
          new apiResponse(200, restaurant, "Restaurant updated successfully.."),
        );
    } catch (err) {
      next(err);
    }
  };


export {createRestaurant , getMyRestaurant, updateRestaurant};

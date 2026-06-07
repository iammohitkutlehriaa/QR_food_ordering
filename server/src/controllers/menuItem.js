import MenuItem from "../models/menuItem.js";
import Restaurant from "../models/restaurant.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// create
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, isVeg, tags, sortOrder } =
      req.body;
    if (!name || !price || !categoryId) {
      throw new apiError(400, "Name , price and categroy is required");
    }
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant  is not found");
    }
    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "menu -items");
      imageUrl = result.secure_url;
    }
    const menuItem = await MenuItem.create({
      restaurantId: restaurant._id,
      categoryId,
      name,
      description,
      price: Number(price),
      image: imageUrl,
      isVeg: isVeg === "false" ? false : true,
      tags: tags ? JSON.parse(tags) : [],
      sortOrder: sortOrder || 0,
    });
    return res
      .status(201)
      .json(
        new apiResponse(201, menuItem, "Menu Item is created successfully"),
      );
  } catch (err) {
    next(err);
  }
};

// get all menu - items
const getMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page -1)*limit;
    const { categoryId, isVeg } = req.query;
    if(categoryId) filter.categoryId = categoryId;
    if (isVeg !== undefined) filter.isVeg = isVeg === "true";
    

    const menuItems = await MenuItem.find(filter)
      .populate("categoryId", "name")
      .sort({ sortOrder: 1, createdAt: 1 })
      .limit(limit)
      .skip(skip)
    return res
      .status(200)
      .json(new apiResponse(200, menuItems, "Menu Itmes fetched succesfully"));
  } catch (err) {
    next(err);
  }
};

// update menuItems;
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, isVeg, isAvailable, tags, sortOrder } =
      req.body;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      throw new apiError(404, "Menu items are not found");
    }
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "menu-items");
      menuItem.image = result.secure_url;
    }
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price) menuItem.price = price;
    if (isVeg !== undefined) menuItem.isVeg = isVeg === "false" ? false : true;
    if (isAvailable !== undefined)
      menuItem.isAvailable = isAvailable === "false" ? false : true;
    if (tags) menuItem.tags = JSON.parse(tags);
    if (sortOrder !== undefined) menuItem.sortOrder = sortOrder;

    await menuItem.save();

    return res
      .status(200)
      .json(
        new apiResponse(200, menuItem, "Menu item is updated successfully"),
      );
  } catch (err) {
    next(err);
  }
};

// delete menu - items

const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) {
      throw new apiError(404, "menu item is not found");
    }
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Menu item deleted successfully"));
  } catch (err) {
    next(err);
  }
};

export { createMenuItem, getMenuItem, updateMenuItem, deleteMenuItem };

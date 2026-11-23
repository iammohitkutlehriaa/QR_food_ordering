import Category from "../models/category.js";
import Restaurant from "../models/restaurant.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import MenuItem from "../models/menuItem.js";

// create category

const createCategory = async (req, res, next) => {
  try {
    const { name, description, sortOrder } = req.body;
    if (!name) {
      throw new apiError(400, "Category name is required");
    }
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      imageUrl = result.secure_url;
    }
    const category = await Category.create({
      restaurantId: restaurant._id,
      name,
      description,
      image: imageUrl,
      sortOrder: sortOrder || 0,
    });
    return res
      .status(201)
      .json(new apiResponse(201, category, "Category is created"));
  } catch (err) {
    next(err);
  }
};

// get all categories

const getCategories = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    const categories = await Category.find({
      restaurantId: restaurant._id,
    }).sort({ sortOrder: 1, createdAt: 1 });
    return res
      .status(200)
      .json(new apiResponse(200, categories, "Categories fetched successfully.."));
  } catch (err) {
    next(err);
  }
};

const getPublicCategories = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) {
      throw new apiError(400, "Restaurant id is required");
    }
    const categories = await Category.find({
      restaurantId,
      isActive: true,
    }).sort({ sortOrder: 1, createdAt: 1 });
    return res
      .status(200)
      .json(new apiResponse(200, categories, "Category fetched sucessFully"));
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    const category = await Category.findOne({
      _id: id,
      restaurantId: restaurant._id,
    });
    if (!category) {
      throw new apiError(404, "Category is not found");
    }
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      category.image = result.secure_url;
    }
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return res
      .status(200)
      .json(new apiResponse(200, category, "Category updated successfully"));
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      throw new apiError(404, "Restaurant is not found");
    }
    const category = await Category.findOne({
      _id: id,
      restaurantId: restaurant._id,
    });
    if (!category) {
      throw new apiError(404, "Category  not found");
    }
    const itemCount = await MenuItem.countDocuments({ categoryId: id });
    if (itemCount > 0) {
      throw new apiError(409, "Category has menu items. Delete or move them first");
    }
    await category.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, {}, "Category is deleted Successfully..."));
  } catch (err) {
    next(err);
  }
};
export { createCategory, getCategories, getPublicCategories, updateCategory, deleteCategory };

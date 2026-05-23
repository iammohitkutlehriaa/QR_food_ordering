import mongoose, { mongo } from "mongoose";
import Restaurant from "./restaurant";

const categorySchema  = new mongoose.Schema(
    {
        RestaurantId: 
        {
            type: mongoose.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
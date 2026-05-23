import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
    {
        restaurantId : {
            type: mongoose.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        categoryId: {
            type: mongoose.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        image: {
            type: String,
            default: "",
        },
        isVeg: {
            type: Boolean,
            default: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {timestamps: true}
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
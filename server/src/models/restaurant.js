import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Restaurent name is required"],
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    address: {
        type: String,
        trim: true,
    },
    logo: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    settings: {
        currency: {
            type: String,
            default: "INR",
        },
        taxPercent: {
            type: Number,
            default: 5,
        }
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
{timestamps: true}
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
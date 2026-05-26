import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    tableNumber : {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    restaurantId: {
        type: mongoose.Types.ObjectId,
        ref:"Restaurant",
    }, 
    qrToken : {
        type: String,
        unique: true,
    },
    qrCode: {
        type: String,
        default: "",
    }
}, {timestamps: true});

const Table = mongoose.model("Table", tableSchema);
export default Table;
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

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model("Table", tableSchema);
export default Table;
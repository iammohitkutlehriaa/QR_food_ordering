import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password : 
        {
            type: String,
            required: [true , "Password is required"],
            minlength: [6 , "Password must be atelast six characters"]
        },
        restaurantId: {
            type: mongoose.Types.ObjectId,
            ref: "Restaurant",
            default: null,
        },
        role: {
            type: String,
            enum: ["admin", "kitchen", "customer"],
            default: "customer",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

//Password hash -- save se phele automatically

userSchema.pre("save",async function() {
    if(!this.isModified("password"))
        return ;
    this.password = await bcrypt.hash(this.password, 10);
    
});

// password compare method
 userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
 };

 const User = mongoose.model("User", userSchema);
 export default User;
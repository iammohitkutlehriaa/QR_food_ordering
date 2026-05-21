import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.ATLAS_DB_URL);
        console.log(`MONGODB Connected 👍  ${conn.connection.host}`)
    } catch(err) {
        console.log(`MONGODB Connection falied 👎 ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;



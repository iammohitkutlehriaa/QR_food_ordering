import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve,reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `Qr-food-ordering/${folder}`,
                transformation: [{width:500 , height: 500, crop: "limit"}],
            },
            (error , result) => {
                if(error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    })
};
export default uploadToCloudinary;
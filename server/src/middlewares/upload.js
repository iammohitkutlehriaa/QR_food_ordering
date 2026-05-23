import multer, { memoryStorage } from "multer";

const storage = memoryStorage();

const upload = multer({
  storage: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, png, webp allowed"), false);
    }
  },
});

export default upload;

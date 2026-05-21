import jwt from "jsonwebtoken";

const generatetoken = (res, userId, role) => {
    const token = jwt.sign(
        {
            userId, role
        },
        process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRE}
    );
    res.cookie("token" , token , {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7*24*60*60*1000,
    });
    return token;
};
export default generatetoken;
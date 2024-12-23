import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies.token;
        console.log("Cookies:", req.cookies);
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        // Synchronously verify the token
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        console.log("Decoded Token:", decode);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }

        // Attach userId to the request object
        req.id = decode.userId;
        console.log("Authenticated User ID:", req.id);
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export default isAuthenticated;

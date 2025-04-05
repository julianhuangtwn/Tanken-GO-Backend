const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { secretOrKey } = require("../config/auth");


module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        console.log("No token provided.");
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        logger.info("Received Token:");
        logger.info(token);  
        const verified = jwt.verify(token.replace("Bearer ", ""), secretOrKey);
        logger.info("Token Verified:");
        logger.info(verified); 
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            logger.error("Token expired:");
            logger.error(error.message);
            return res.status(401).json({ message: "Token expired" });
        }

        logger.error("Invalid Token:", error.message);
        res.status(400).json({ message: "Invalid Token" });
    }
};

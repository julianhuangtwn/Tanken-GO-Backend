const jwt = require("jsonwebtoken");
const logger = require("../logger");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        console.log("No token provided.");
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        logger.info("Received Token:", token);  
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        logger.info("Token Verified:", verified); 
        req.user = verified;
        next();
    } catch (error) {
        logger.error("Invalid Token:", error.message);
        res.status(400).json({ message: "Invalid Token" });
    }
};

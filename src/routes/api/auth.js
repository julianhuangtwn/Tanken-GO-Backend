const express = require("express");
const authenticate = require("../../auth/authenticate"); //user is authenticated
const { findUserByEmail } = require("../../models/data/findUserByEmail"); 

const router = express.Router();

//fetch authenticated user details
router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await findUserByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            userId: user.USERID,
            firstName: user.FIRST_NAME,
            email: user.EMAIL,
        });
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;

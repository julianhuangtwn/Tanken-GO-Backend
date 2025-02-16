const { findUserByEmail } = require('../models/data/findUserByEmail');
const { findUserByPhone } = require('../models/data/findUserByPhone');
const { createSuccessResponse, createErrorResponse } = require('../response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json(createErrorResponse(400, "Missing credentials"));
        }

        let user;
        if (identifier.includes("@")) {
            user = await findUserByEmail(identifier);
        } else {
            user = await findUserByPhone(identifier);
        }

        if (!user) {
            return res.status(401).json(createErrorResponse(401, "User not found"));
        }

        const match = await bcrypt.compare(password, user.PASSWORD);

        if (!match) {
            return res.status(401).json(createErrorResponse(401, "Invalid password"));
        }

        //JWT Token generation
        const token = jwt.sign({ USERID: user.USERID, email: user.EMAIL }, process.env.JWT_SECRET, { expiresIn: "120s" });

        return res.status(200).json(createSuccessResponse({ message: "Login Successful", token }));
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json(createErrorResponse(500, "Internal Server Error"));
    }
};

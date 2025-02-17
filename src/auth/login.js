const { User } = require('../models/user.js');
const { createSuccessResponse, createErrorResponse } = require('../response.js')

const { secretOrKey } = require('../config/auth.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json(createErrorResponse(400, "Missing credentials"));
        }

        let user;
        user = await User.findByIdentifier(identifier);
        if (!user) {
            return res.status(401).json(createErrorResponse(401, "User not found"));
        }

        // Verify the password
        let match = await User.validatePassword(password, user.PASSWORD);
        if (!match) {
            return res.status(401).json(createErrorResponse(401, "Invalid password"));
        }

        let payload = {
            userId: user.USERID,
            email: user.EMAIL,
            phone: user.PHONE_NUMBER,
            fullName: user.FIRST_NAME + ' ' + user.LAST_NAME,
        }
        let token = jwt.sign(payload, secretOrKey);

        return res.status(200).json(createSuccessResponse( { message: 'Login Successful', token: token}));
    } catch(err) {
        return res.status(500).json(createErrorResponse(500, err.message));
    }
};

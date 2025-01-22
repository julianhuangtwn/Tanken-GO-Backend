const { findUserByEmail } = require('../../models/data/findUserbyEmail.js');
const { findUserByPhone } = require('../../models/data/findUserByPhone.js');
const { createSuccessResponse, createErrorResponse } = require('../../response')

module.exports = async (req, res) => {
    try{
        const { identifier, password } = req.body;

        // Check if the credentials are missing or not
        if (!identifier || !password) {
            return res.status(400).json(createErrorResponse('Missing credentials'));
        }

        // Determine if identifier is an email or phone number
        let user;
        if (identifier.includes('@')) {
            user = await findUserByEmail(identifier);
        } else {
            user = await findUserByPhone(identifier);
        }
        if (!user) {
            return res.status(401).json(createErrorResponse('User not found'));
        }

        // Verify the password
        if (password !== user.PASSWORD) {
            return res.status(401).json(createErrorResponse('Invalid password'));
        }

        return res.status(200).json(createSuccessResponse( { message: 'Login Successful'}));
    } catch(err) {
        return res.status(500).json(createErrorResponse(500, err.message));
    }
}   
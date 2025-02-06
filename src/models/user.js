const { getUserByIdentifier } = require('./data/user-service');
const bcrypt = require('bcrypt');

class User {
    /**
     * Finds a user by their identifier
     * @param {string} identifier - The email or phone number of the user
     * @returns {Promise<Object>|null} - The user object if found, or null if not found
     */
    static async findByIdentifier(identifier) {
        try {
            const userData = await getUserByIdentifier(identifier);
            return userData;
        } catch (err) {
            console.error('Error fetching user by identifier:', err);
            throw err;
        }
    }

    /**
     * Check if a user password is correct
     * @param {string} password - The password to check
     * @param {string} userPassword - The user's password
     * @returns {boolean} - True if the password is correct, false otherwise
     */
    static async validatePassword (password, userPassword) {
        return bcrypt.compare(password, userPassword)
    }

}

module.exports = { User };
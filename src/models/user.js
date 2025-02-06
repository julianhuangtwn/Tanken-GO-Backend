const { getUserByIdentifier } = require('./data/user-service');

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

}

module.exports = User;
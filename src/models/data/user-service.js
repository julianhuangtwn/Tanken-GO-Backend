const logger = require('../../logger');
const { connectToDB } = require('./index');

async function getUserByIdentifier(identifier) {
    try {
        const connection = await connectToDB();
        let result;

        if (identifier.includes('@')) {
            result = await connection.execute(
                `SELECT * FROM admin.tankenusers WHERE email = :identifier`,
                { identifier },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }  // IMPORTANT: Return rows as objects
              );
        } else {
            result = await connection.execute(
                `SELECT * FROM admin.tankenusers WHERE phone_number = :identifier`,
                { identifier },
                { outFormat: require('oracledb').OUT_FORMAT_OBJECT }  // IMPORTANT: Return rows as objects
              );
        }
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    catch (err) {
        logger.error('Error fetching user by identifier:', err);
        throw err;
    }
}


module.exports = { getUserByIdentifier };
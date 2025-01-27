const { connectToDB } = require('.');

/**
 * Find a single user row by phone
 * @param {string} phone - The phhone number to search for
 * @returns {Object|null} - Returns the user object if found, or null if not found
 */

async function findUserByPhone(phone) {
  try {
    const connection = await connectToDB(); 
    const result = await connection.execute(
      `SELECT * FROM admin.tankenusers WHERE phone_number = :phone`,
      { phone },
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }  // IMPORTANT: Return rows as objects

    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error fetching user by phone:', err);
    throw err;
  }
} 

module.exports = { findUserByPhone };
 
const { connectToDB } = require('./');

async function findAll() {
  try {
    const connection = await connectToDB(); 
    const result = await connection.execute(`SELECT * FROM admin.tankenusers`);
    return result.rows;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw err;
  }
} 

module.exports = { findAll };
 
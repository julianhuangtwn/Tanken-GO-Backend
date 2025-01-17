// src/model/data/index.js
const oracledb = require('oracledb');
//const logger = require('../../logger');

let connection = null;


async function connectToDB() {
  if (!connection) {
    try {
      connection = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        connectString: process.env.DB_URL
      });
      console.log('Connected to OracleDB!');
    } catch (err) {
      console.error('Error connecting to OracleDB:', err);
      throw err;
    }
  }
  return connection; 
}

module.exports = { connectToDB };

 
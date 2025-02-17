const logger = require('../../logger');
const { connectToDB } = require('./index');


async function createTrip(tripData) {
    try {
        const connection = await connectToDB();
        const {
            userId,
            tripName,
            startDate,
            endDate,
            totalCostEstimate,
            isPublic
        } = tripData;


        // Retrieve the current maximum TRIPID to generate a new numeric ID.
        const maxResult = await connection.execute(
            `SELECT NVL(MAX(TRIPID), 0) AS maxId FROM admin.Trip`,
            {},
            { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
        );
        const maxId = Number(maxResult.rows[0].MAXID) || 0;
        const newTripId = maxId + 1;

        const result = await connection.execute(
            `INSERT INTO admin.Trip (TRIPID, USERID, TRIPNAME, STARTDATE, ENDDATE, TOTALCOSTESTIMATE, ISPUBLIC)
             VALUES (:tripId, :userId, :tripName, TO_DATE(:startDate, 'YYYY-MM-DD'),
                     TO_DATE(:endDate, 'YYYY-MM-DD'), :totalCostEstimate, :isPublic)`,
            {
                tripId: newTripId,
                userId,
                tripName,
                startDate,
                endDate,
                totalCostEstimate,
                isPublic,
            },
            { autoCommit: true }
          );

          if (result.rowsAffected === 0) {
              throw new Error('Trip not created.');
            }

        return { tripId: newTripId, message: 'Trip created successfully!' };

    } catch (err) {
        logger.error('Error creating trip:', err);
        throw err;
    }
}

async function updateTrip(tripId, tripData) {
    try {
        const connection = await connectToDB();
        const {
            tripName,
            startDate,
            endDate,
            totalCostEstimate,
            isPublic
        } = tripData;

        const result = await connection.execute(
            `UPDATE admin.Trip
            SET TRIPNAME = :tripName,
                STARTDATE = TO_DATE(:startDate, 'YYYY-MM-DD'),
                ENDDATE = TO_DATE(:endDate, 'YYYY-MM-DD'),
                TOTALCOSTESTIMATE = :totalCostEstimate,
                ISPUBLIC = :isPublic
            WHERE TRIPID = :tripId`,
            { tripName, startDate, endDate, totalCostEstimate, isPublic, tripId },
            { autoCommit: true }
        );
        
        if (result.rowsAffected === 0) {
            throw new Error('Trip not found.');
        }

        return { tripId, message: 'Trip updated successfully!' };

    } catch (err) {
        logger.error('Error updating trip:', err);
        throw err;
    }
}

async function deleteTrip(tripId) {
    try {
      const connection = await connectToDB();
      const result = await connection.execute(
        `DELETE FROM admin.Trip
         WHERE TRIPID = :tripId`,
        { tripId },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        throw new Error('Trip not found.');
      }

      return { tripId, message: "Trip deleted successfully" };
    } catch (err) {
      logger.error('Error deleting trip:', err);
      throw err;
    }
}

async function getTripById(tripId) {
    try {
        const connection = await connectToDB();
        const result = await connection.execute(
            `SELECT TRIPID, USERID, TRIPNAME, 
                    TO_CHAR(STARTDATE, 'YYYY-MM-DD') AS STARTDATE, 
                    TO_CHAR(ENDDATE, 'YYYY-MM-DD') AS ENDDATE, 
                    TOTALCOSTESTIMATE, ISPUBLIC
             FROM admin.Trip
             WHERE TRIPID = :tripId`,
            { tripId },
            { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        logger.error('Error fetching trip by id:', err);
        throw err;
    }
}

async function getTripsByUser(userId) {
    try {
        const connection = await connectToDB();
        const result = await connection.execute(
            `SELECT TRIPID, USERID, TRIPNAME, 
                TO_CHAR(STARTDATE, 'YYYY-MM-DD') AS STARTDATE, 
                TO_CHAR(ENDDATE, 'YYYY-MM-DD') AS ENDDATE, 
                TOTALCOSTESTIMATE, ISPUBLIC
            FROM admin.Trip
            WHERE USERID = :userId`,
            { userId },
            { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
        );
        return result.rows.length > 0 ? result.rows : null;
    } catch (err) {
        logger.error('Error fetching trips by user:', err);
        throw err;
    }
}

module.exports = { createTrip, updateTrip, deleteTrip, getTripById, getTripsByUser };
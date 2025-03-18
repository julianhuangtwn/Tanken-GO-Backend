const logger = require('../../logger');
const { connectToDB } = require('./index');
const oracledb = require('oracledb');


async function createTrip(tripData) {
    try {
        const connection = await connectToDB();
        const {
            userid,
            tripName,
            startDate,
            endDate,
            totalCostEstimate,
            isPublic,
            destinations, //  array of destination objects 
        } = tripData;

        
        // NEW ID GENERATION LOGIC ---------------------------------------------------------
        // Retrieve the current maximum TRIPID to generate a new numeric ID.
        const maxResult = await connection.execute(
            `SELECT NVL(MAX(TRIPID), 0) AS maxId FROM admin.Trip`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const maxId = Number(maxResult.rows[0].MAXID) || 0;
        const newTripId = maxId + 1;

        logger.info("FROM INSIDE TRIP SERVICE")
        logger.info(            {
            tripId: newTripId,
            userid,
            tripName,
            startDate,
            endDate,
            totalCostEstimate,
            isPublic,
        });

        // Insert the new trip into the database without autocommitting -------------------------------------------
        const result = await connection.execute(
            `INSERT INTO admin.Trip (TRIPID, USERID, TRIPNAME, STARTDATE, ENDDATE, TOTALCOSTESTIMATE, ISPUBLIC)
             VALUES (:tripId, :userid, :tripName, TO_DATE(:startDate, 'YYYY-MM-DD'),
                     TO_DATE(:endDate, 'YYYY-MM-DD'), :totalCostEstimate, :isPublic)`,
            {
                tripId: newTripId,
                userid,
                tripName,
                startDate,
                endDate,
                totalCostEstimate,
                isPublic,
            },
            { autoCommit: false }
          );

          // If destinations are provided, insert them into DESTINATION and TRIPDESTINATION tables -------------------
          if (destinations && Array.isArray(destinations)) {
            for (let dest of destinations) {
                // Generate a new destination ID ---------------------------------------------------
                const maxDestResult = await connection.execute(
                    `SELECT NVL(MAX(DESTINATIONID), 0) AS maxId FROM admin.DESTINATION`,
                    {},
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                const maxDestId = Number(maxDestResult.rows[0].MAXID) || 0;
                const newDestId = maxDestId + 1;

                // Insert the new destination into the DESTINATION table
                await connection.execute(
                    `INSERT INTO admin.DESTINATION (DESTINATIONID, NAME, DESCRIPTION, CITY, COUNTRY, COORDINATES, CATEGORY, IMG_URL, VISIT_DATE, TRIPID, LATITUDE, LONGITUDE)
                     VALUES (:destinationid, :name, :description, :city, :country, :coordinates, :category, :img_url, TO_DATE(:visit_date, 'YYYY-MM-DD'), :tripId, :latitude, :longitude)`,
                    {
                        destinationid: newDestId,
                        name: dest.name,
                        description: dest.description,
                        city: dest.city,
                        country: dest.country,
                        coordinates: dest.coordinates,
                        category: dest.category,
                        img_url: dest.img_url,
                        visit_date: dest.visit_date,
                        tripId: newTripId,
                        latitude: dest.latitude,
                        longitude: dest.longitude,
                    },
                    { autoCommit: false }
                );

                // Generate a new trip-destination ID ------------------------------------------------
                const maxTripDestResult = await connection.execute(
                    `SELECT NVL(MAX(TRIPDESTINATIONID), 0) AS maxId FROM admin.TRIPDESTINATION`,
                    {},
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                const maxTripDestId = Number(maxTripDestResult.rows[0].MAXID) || 0;
                const newTripDestId = maxTripDestId + 1;

                // Insert into TRIPDESTINATION table to link the trip and destination.
                await connection.execute(
                    `INSERT INTO admin.TRIPDESTINATION (TRIPDESTINATIONID, TRIPID, DESTINATIONID)
                    VALUES (:tripDestinationId, :tripId, :destinationId)`,
                    {
                        tripDestinationId: newTripDestId,
                        tripId: newTripId,
                        destinationId: newDestId,
                    },
                    { autoCommit: false }
                );
            }
        }

        if (result.rowsAffected === 0) {
            throw new Error('Trip not created.');
        }

        await connection.commit();
        return { tripId: newTripId, message: 'Trip created successfully!' };

    } catch (err) {
        logger.error('Error creating trip:');
        logger.error(err);
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

// async function deleteTrip(tripId) {
//     try {
//       const connection = await connectToDB();
//       logger.info(`Deleting trip with ID ${tripId}`);
//       await connection.execute(
//         `DELETE FROM admin.TRIPDESTINATION
//         WHERE TRIPID = :tripId`,
//         { tripId },
//         { autoCommit: true }
//       );
      

//       const result = await connection.execute(
//         `DELETE FROM admin.TRIP
//          WHERE TRIPID = :tripId`,
//         { tripId },
//         { autoCommit: true }
//       );

//       if (result.rowsAffected === 0) {
//         throw new Error('Trip not found.');
//       }

//       return { tripId, message: "Trip deleted successfully" };
//     } catch (err) {
//       logger.error('Error deleting trip:');
//       logger.error(err);
//       throw err;
//     }
// }

async function deleteTrip(tripId) {
    try {
      const connection = await connectToDB();
      logger.info(`Deleting trip with ID ${tripId}`);
  
      // Step 1: Delete from TRIPDESTINATION table
      const destinationResult = await connection.execute(
        `DELETE FROM admin.Tripdestination
         WHERE TRIPID = :tripId`,
        { tripId },
        { autoCommit: true }
      );
  
      // Log how many rows were deleted from TRIPDESTINATION
      logger.info(`Deleted ${destinationResult.rowsAffected} records from TRIPDESTINATION.`);
  
      // Step 2: Delete from TRIP table
      const result = await connection.execute(
        `DELETE FROM admin.Trip
         WHERE TRIPID = :tripId`,
        { tripId },
        { autoCommit: true }
      );
  
      // Log how many rows were deleted from TRIP
      logger.info(`Deleted ${result.rowsAffected} records from TRIP.`);
  
      if (result.rowsAffected === 0) {
        throw new Error('Trip not found or already deleted.');
      }
  
      return { tripId, message: "Trip deleted successfully" };
    } catch (err) {
      logger.error('Error deleting trip:');
      logger.error(err);
      throw new Error(`Error deleting trip with ID ${tripId}: ${err.message}`);
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

async function getTripsByUser(userid) {
    try {
        const connection = await connectToDB();
        const result = await connection.execute(
            `SELECT TRIPID, USERID, TRIPNAME, 
                TO_CHAR(STARTDATE, 'YYYY-MM-DD') AS STARTDATE, 
                TO_CHAR(ENDDATE, 'YYYY-MM-DD') AS ENDDATE, 
                TOTALCOSTESTIMATE, ISPUBLIC
            FROM admin.Trip
            WHERE USERID = :userid`,
            { userid },
            { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
        );
        return result.rows.length > 0 ? result.rows : null;
    } catch (err) {
        logger.error('Error fetching trips by user:', err);
        throw err;
    }
}

module.exports = { createTrip, updateTrip, deleteTrip, getTripById, getTripsByUser };
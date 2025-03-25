const { connectToDB } = require("./index.js");

async function getTripDetails(tripId) {
  let connection;
  try {
    connection = await connectToDB();
    console.log("Connected to DB. Fetching trip details...");

    const result = await connection.execute(
      `SELECT T.TRIPID, T.TRIPNAME, T.STARTDATE, T.ENDDATE, T.TOTALCOSTESTIMATE,
              U.FIRST_NAME || ' ' || U.LAST_NAME AS USERNAME,
              D.NAME AS DESTINATION_NAME, DBMS_LOB.SUBSTR(D.DESCRIPTION, 4000, 1) AS DESCRIPTION, D.CITY, D.COUNTRY, D.COORDINATES, D.CATEGORY, D.VISIT_DATE
       FROM ADMIN.TRIP T
       JOIN ADMIN.TRIPDESTINATION TD ON T.TRIPID = TD.TRIPID
       JOIN ADMIN.DESTINATION D ON TD.DESTINATIONID = D.DESTINATIONID
       JOIN ADMIN.TANKENUSERS U ON T.USERID = U.USERID
       WHERE T.TRIPID = :tripId
       ORDER BY D.VISIT_DATE ASC`,
      [tripId]
    );

    if (!result.rows?.length) {
      throw new Error("No trip details found");
    }

    // Initialize trip details object
    const tripDetails = {
      tripId: result.rows[0][0],
      tripName: result.rows[0][1],
      startDate: result.rows[0][2].toISOString().split('T')[0],
      endDate: result.rows[0][3].toISOString().split('T')[0],
      totalCostEstimate: result.rows[0][4],
      username: result.rows[0][5],
      attractionCount: 0,
      restaurantCount: 0,
      hotelCount: 0,
      destinationsByDay: {}
    };

    // Process each row in the result
    result.rows.forEach(row => {
      const [
        , , , , , , 
        destinationName, 
        description,
        city, 
        country, 
        coordinates, 
        category, 
        visitDate
      ] = row;

      const formattedDate = visitDate.toISOString().split('T')[0];

      // Initialize the date key if it doesn't exist
      if (!tripDetails.destinationsByDay[formattedDate]) {
        tripDetails.destinationsByDay[formattedDate] = [];
      }

      // Add destination details to the corresponding date
      tripDetails.destinationsByDay[formattedDate].push({
        destinationName,
        description,
        city,
        country,
        coordinates: coordinates || null,
        category,
        visitDate: formattedDate
      });
    });

    console.log("Formatted Trip Details:\n", JSON.stringify(tripDetails, null, 2));
    return { status: "ok", data: [tripDetails] };

  } catch (err) {
    console.error("Error fetching trip details:", err);
    return {
      status: "error",
      error: { code: 500, message: err.message || "Failed to fetch trip details" }
    };
  }
}

module.exports = { getTripDetails };
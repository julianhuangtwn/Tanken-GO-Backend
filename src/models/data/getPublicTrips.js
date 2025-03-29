// src/models/data/getPublicTrips.js
const { connectToDB } = require("./index.js");

async function getPublicTrips() {
  let connection;
  try {
    connection = await connectToDB();
    console.log("Connected to DB. Fetching public trips...");

    const result = await connection.execute(
      `SELECT T.TRIPID, T.TRIPNAME,
              T.STARTDATE, T.ENDDATE, T.TOTALCOSTESTIMATE, 
              D.IMG_URL, D.CITY, D.COUNTRY
       FROM ADMIN.TRIP T
        JOIN (
          SELECT TD.TRIPID, TD.DESTINATIONID
          FROM ADMIN.TRIPDESTINATION TD
          WHERE (TD.TRIPDESTINATIONID) IN (
            SELECT MIN(TD2.TRIPDESTINATIONID)
            FROM ADMIN.TRIPDESTINATION TD2
            GROUP BY TD2.TRIPID
          )
        ) FirstDest ON T.TRIPID = FirstDest.TRIPID
        JOIN ADMIN.DESTINATION D ON FirstDest.DESTINATIONID = D.DESTINATIONID
        WHERE T.ISPUBLIC = 'Y'
        ORDER BY T.STARTDATE ASC`
    );

    console.log("Raw database response:", result.rows);

    if (!result.rows || result.rows.length === 0) {
      console.warn("⚠️ No public trips found!");
      return { status: "ok", data: [] };
    }

    // Format the result into objects
    const trips = result.rows.map(row => ({
      tripId: row[0],
      tripName: row[1],
      startDate: row[2],
      endDate: row[3],
      totalCostEstimate: row[4],
      imageUrl: row[5],
      city: row[6],
      country: row[7]
    }));

    console.log("Formatted Trips Data:", trips);
    return { status: "ok", data: trips };
  } catch (err) {
    console.error("Error fetching public trips:", err);
    return { status: "error", error: { code: 500, message: "Failed to fetch public trips" } };
  } 
}

module.exports = { getPublicTrips };

const { connectToDB } = require("./index.js");

async function getTripDetails(tripId) {
  let connection;
  try {
    connection = await connectToDB();
    console.log("Connected to DB. Fetching trip details...");

    const result = await connection.execute(
      `SELECT T.TRIPID, T.TRIPNAME, T.STARTDATE, T.ENDDATE, T.TOTALCOSTESTIMATE,
              U.FIRST_NAME || ' ' || U.LAST_NAME AS USERNAME,
              D.NAME AS DESTINATION_NAME, D.CITY, D.COUNTRY, D.COORDINATES, D.CATEGORY, D.VISIT_DATE
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

    const [tripIdValue, tripName, startDate, endDate, totalCostEstimate, username] = result.rows[0];
    const destinationsByDay = {};
    let attractionCount = 0, restaurantCount = 0, hotelCount = 0;

    result.rows.forEach(row => {
      const [, , , , , , destinationName, city, country, coordinates, category, visitDate] = row;
      if (category === 'attraction') attractionCount++;
      if (category === 'restaurant') restaurantCount++;
      if (category === 'hotel') hotelCount++;

      const dateKey = visitDate?.toISOString().split('T')[0] || 'No Date';
      if (!destinationsByDay[dateKey]) {
        destinationsByDay[dateKey] = [];
      }
      destinationsByDay[dateKey].push({
        destinationName,
        city,
        country,
        coordinates: coordinates || null,
        category,
        visitDate: dateKey
      });
    });

    const tripDetail = {
      tripId: tripIdValue,
      tripName,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalCostEstimate,
      username,
      attractionCount,
      restaurantCount,
      hotelCount,
      destinationsByDay,
    };

    console.log("Formatted Trip Details:\n" + JSON.stringify(tripDetail, null, 2));
    return { status: "ok", data: [tripDetail] };
  } catch (err) {
    console.error("Error fetching trip details:", err);
    return {
      status: "error",
      error: { code: 500, message: err.message || "Failed to fetch trip details" }
    };
  }
}

module.exports = { getTripDetails };

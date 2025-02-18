// src/routes/api/publicTrips.js
const { getPublicTrips } = require('../../models/data/getPublicTrips');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
    try {
        const trips = await getPublicTrips();
        res.status(200).json(createSuccessResponse(trips));
    } catch (err) {
        console.error("Error fetching public trips:", err);
        res.status(500).json(createErrorResponse(500, "Failed to fetch public trips"));
    }
};

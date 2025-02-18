// src/routes/api/tripDetails.js
const { getTripDetails } = require('../../models/data/getTripDetails');

module.exports = async (req, res) => {
  const { tripId } = req.params;
  try {
    const tripDetails = await getTripDetails(tripId);
    if (!tripDetails || tripDetails.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Trip not found' });
    }
    res.status(200).json({ status: 'ok', data: tripDetails });
  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

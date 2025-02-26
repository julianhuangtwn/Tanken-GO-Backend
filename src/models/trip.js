const { getTripById, createTrip, updateTrip, deleteTrip, getTripsByUser } = require('./data/trip-service');
const logger = require('../logger');

class Trip {
    constructor({ tripId, userid, tripName, startDate, endDate, totalCostEstimate, isPublic }) {
        this.tripId = tripId;
        this.userid = userid;
        this.tripName = tripName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalCostEstimate = totalCostEstimate;
        this.isPublic = isPublic;
    }

    /**
     * Creates a new Trip instance and persists it to the database.
     * @param {Object} tripData - The trip details.
     * @returns {Promise<Trip>} - A new Trip instance.
     */
    static async create(tripData) {
        try {
            const { tripId } = await createTrip(tripData);
            return new Trip({ ...tripData, tripId });
        } catch (err) {
            logger.error('Error creating trip in Trip class:', err);
            throw err;
        }
    }

    /**
     * Updates the current trip.
     * @param {Object} tripData - The updated trip details.
     * @returns {Promise<Object>} - Result of the update operation.
     */
    async update(tripData) {
        try {
            const result = await updateTrip(this.tripId, tripData);
            // update local properties
            Object.assign(this, tripData);
            return result;
        } catch (err) {
            logger.error('Error updating trip in Trip class:', err);
            throw err;
        }
    }

  /**
   * Deletes the current trip from the database.
   * @returns {Promise<Object>} - Result of the delete operation.
   */
    static async delete(tripId) {
        try {
        const result = await deleteTrip(tripId);
        return result;
        } catch (err) {
        logger.error('Error deleting trip in Trip class:', err);
        throw err;
        }
    }


    /**
     * Finds a trip by its TRIPID.
     * @param {number} tripId - The unique identifier of the trip.
     * @returns {Promise<Object>|null} - The trip object if found, or null if not found.
     */
    static async findById(tripId) {
        try {
            const tripData = await getTripById(tripId);
            return tripData;
        } catch (err) {
            logger.error('Error fetching trip by ID:', err);
            throw err;
        }
    }

    /**
     * Finds all trips for a user.
     * @param {number} userid - The unique identifier of the user.
     * @returns {Promise<Array>} - An array of trip objects.
     */
    static async getAllByUser(userid) {
        try {
            const tripData = await getTripsByUser(userid);
            return tripData;
        } catch (err) {
            logger.error('Error fetching trips by user ID:', err);
            throw err;
        }
    }
}

module.exports = { Trip };
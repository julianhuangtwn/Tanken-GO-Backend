const { Trip } = require('../../models/trip');
const logger = require('../../logger');

exports.getTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        res.json({
            tripId: trip.TRIPID,
            userId: trip.USERID,
            tripName: trip.TRIPNAME,
            startDate: trip.STARTDATE,
            endDate: trip.ENDDATE,
            totalCostEstimate: trip.TOTALCOSTESTIMATE,
            isPublic: trip.ISPUBLIC,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTrip = async (req, res) => {
    try {
        // Ensure the authenticated user's ID is used.
        // Note: req.user is set by the authenticate middleware.
        const user = req.user;
        logger.info(`Authenticated user:`);
        logger.info(user);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }
        const userId = user.userId;

        // Extract trip details from the request body.
        const { tripName, startDate, endDate, totalCostEstimate, isPublic } = req.body;
        const tripData = { userId: userId, tripName, startDate, endDate, totalCostEstimate, isPublic };

        logger.info(`Creating trip with data:`);
        logger.info(tripData);
        const trip = await Trip.create(tripData);
        res.status(201).json({ message: "Trip created successfully", trip });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        // Optionally enforce that only the owner can update the trip.
        if (trip.USERID !== req.user.userId) {
            return res.status(403).json({ error: "Unauthorized: Cannot update another user's trip" });
        }
        const updateResult = await trip.update(req.body);
        res.status(201).json({ message: "Trip updated successfully", updateResult });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        // Optionally enforce that only the owner can delete the trip.
        if (trip.USERID !== req.user.userId) {
            return res.status(403).json({ error: "Unauthorized: Cannot delete another user's trip" });
        }
        const deleteResult = await Trip.delete(tripId);
        res.status(201).json({ message: "Trip deleted successfully", deleteResult });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTripsByUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        logger.info(`Authenticated User!:`);
        logger.info(userId);

        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }
        logger.info(`Fetching trips for user ID ${userId}`);
        const trips = await Trip.getAllByUser(userId);
        res.json({
            trips: trips.map(trip => ({
                tripId: trip.TRIPID,
                userId: trip.USERID,
                tripName: trip.TRIPNAME,
                startDate: trip.STARTDATE,
                endDate: trip.ENDDATE,
                totalCostEstimate: trip.TOTALCOSTESTIMATE,
                isPublic: trip.ISPUBLIC,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// src/routes/api/index.js
const express = require('express');

const authenticate = require("../../auth/authenticate");
const commentsController = require("./commentsController");
const tripController = require("./tripController");

const router = express.Router();

router.get("/comments/:tripId", commentsController.getComments);
router.post("/comments", authenticate, commentsController.addComment);
router.put("/comments/:commentId", authenticate, commentsController.updateComment);
router.delete("/comments/:commentId", authenticate, commentsController.deleteComment);

router.get('/users', require('./get'));
router.post('/ai', require('./ai'))

// Trip routes
router.get('/trip/:tripId', tripController.getTrip);
router.get('/trip', tripController.getTripsByUser);
router.post('/trip', tripController.createTrip);
router.put('/trip/:tripId', tripController.updateTrip);
router.delete('/trip/:tripId', tripController.deleteTrip);

module.exports = router;
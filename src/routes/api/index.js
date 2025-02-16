
// src/routes/api/index.js
const express = require('express');

const authenticate = require("../../auth/authenticate");
const commentsController = require("./commentsController");

const router = express.Router();

router.get("/comments/:tripId", commentsController.getComments);
router.post("/comments", authenticate, commentsController.addComment);
router.put("/comments/:commentId", authenticate, commentsController.updateComment);
router.delete("/comments/:commentId", authenticate, commentsController.deleteComment);

router.get('/users', require('./get'));
router.post('/ai', require('./ai'))

module.exports = router;
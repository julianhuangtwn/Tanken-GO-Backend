
// src/routes/api/index.js
const express = require('express');

const authenticate = require("../../auth/authenticate");

const { 
    addComment, 
    getComments, 
    updateComment, 
    deleteComment 
} = require("../../models/data/comments");

const router = express.Router();

router.get("/comments/:tripId", async (req, res) => {
    try {
        const comments = await getComments(req.params.tripId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/comments", authenticate, async (req, res) => {
    try {
        const { tripId, content, rating } = req.body;
        const userId = req.user.USERID;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const response = await addComment(userId, tripId, content, rating);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put("/comments/:commentId", authenticate, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, rating } = req.body;
        const userId = req.user.USERID;

        if (!content.trim()) {
            return res.status(400).json({ error: "Content cannot be empty" });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }
        const result = await updateComment(commentId, userId, content, rating);

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/comments/:commentId", authenticate, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.USERID;

        const result = await deleteComment(commentId, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/users', require('./get'));
router.post('/ai', require('./ai'))

module.exports = router;
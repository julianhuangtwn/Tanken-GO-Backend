
// src/routes/api/index.js
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

router.get('/users', require('./get'));
router.post('/login', require('./login')); // Handle post requests to login route
router.get('/ai', require('./ai')) // going to change that to post

module.exports = router;
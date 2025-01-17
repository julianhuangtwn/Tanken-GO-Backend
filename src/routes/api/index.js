// src/routes/api/index.js
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

router.get('/users', require('./get'));

module.exports = router;
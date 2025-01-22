
// src/routes/api/index.js
const express = require('express');
const { example } = require('../../ai');
const { createSuccessResponse, createErrorResponse } = require('../../response')

// Create a router on which to mount our API endpoints
const router = express.Router();

router.get('/users', require('./get'));
router.post('/login', require('./login')); // Handle post requests to login route

router.get('/ai', async(req,res) =>{
    try{
        res.status(200).json(createSuccessResponse(await example()));
    } catch(err) {
        res.status(500).json(createErrorResponse(500, err.message));
    }
  })

module.exports = router;
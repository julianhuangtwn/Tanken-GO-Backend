// src/routes/index.js

const express = require('express');

// version and author from package.json
const { version } = require('../../package.json');

const { createSuccessResponse } = require('../response');

const { hostname } = require('os');
const passport = require('passport');

// Create a router that we can use to mount our API
const router = express.Router();
router.use("/auth", require("../auth/register"));
router.use('/auth', require('../auth/login'));
router.use("/api/auth", require("./api/auth"));

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
// session: false. This is because we require credentials to be supplied with each request, rather than set up a session.
// !!! Commented for now !!!
router.use(`/v1`, passport.authenticate('jwt', { session: false }), require('./api'));
// !!! Changed to : 
// router.use(`/v1`, require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');

  // Send a 200 'OK' response
  res.status(200).json(
    createSuccessResponse({
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});


module.exports = router;
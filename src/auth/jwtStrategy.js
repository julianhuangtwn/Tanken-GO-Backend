// SET UP JWT STRATEGY
const logger = require('../logger');
const passportJWT = require('passport-jwt');
const { secretOrKey } = require('../config/auth');

// JSON Web Token strategy
let JwtStrategy = passportJWT.Strategy;
let ExtractJwt = passportJWT.ExtractJwt;

// Configure the JWT strategy
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('jwt'),
    secretOrKey,
};

// Create a new instance of the JWT strategy
let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    // This function is called whenever a JWT is presented to the server
    // Here we can validate the token and look up the user if necessary
    logger.info('JWT payload received: ');
    logger.info(jwt_payload);
    if (jwt_payload) {
        next(null,  {
            userId: jwt_payload.userId,
            email: jwt_payload.email,
            phone: jwt_payload.phone,
            fullName: jwt_payload.fullName,
        });
    } else {
        next(null, false);
    }
});

module.exports = strategy;
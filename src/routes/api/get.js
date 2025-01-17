const { findAll } = require('../../models/data/findAll')
const { createSuccessResponse, createErrorResponse } = require('../../response')
//const logger = require('../../logger');

module.exports = async (req, res) => {
    try{
        res.status(200).json(createSuccessResponse(await findAll()));
    } catch(err) {
        res.status(500).json(createErrorResponse(500, err.message));
    }
}   
const { generateTrip } = require("../../ai")
const { createSuccessResponse, createErrorResponse } = require('../../response')

module.exports = async(req,res) =>{
    try{
        return res.status(200).json(createSuccessResponse(await generateTrip(req)));
    } catch(err) {
        return res.status(500).json(createErrorResponse(500, err.message));
    }
  }
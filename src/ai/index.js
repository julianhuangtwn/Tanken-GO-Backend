const OpenAI = require('openai')
// const logger = require('../../src/logger');

async function example(req) {
  // Initialize OpenAI with the API key from .env
  const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
  });

  // Make the API call
  const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
          { role: "system", content: "You are tasked to give trip itineraries based on the user provided location and duration. If the user doesn't provide a location or duration, make sure to ask them where or when the trip is. If they user asks non-trip related questions, don't answer their questions. You are to only give specific a list of tourist attraction, no food, no bar related answers. Answer the question in the format: 1. Title: Name of the tourist attraction. Description: Description of the tourist attraction. 2. Title: Name of the tourist attraction. Description: Description of the tourist attraction." },
          {
              role: "user",
              content: req.body.message,
          },
      ],
  });

//    return {data:req.body} 
  return { data: completion.choices[0].message };

}

module.exports = { example };

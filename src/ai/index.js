const OpenAI = require('openai');
const { zodResponseFormat } = require('openai/helpers/zod');
const logger = require('../logger');
const { z } = require('zod');

// Gets user's local time
const currDate = new Date().toLocaleDateString("en-CA");
logger.debug({currDate}, "Time");

// Schemas to enforce AI Model's return type
const Destination = z.object({
  name: z.string(),
  description: z.string(),
  city: z.string(),
  country: z.string(),
  coordinates: z.string(),
  category: z.string(),
  visit_date: z.string()
});

const Trip = z.object({
  tripName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalCostEstimate: z.number(),
  isPublic: z.boolean(),
  destinations: z.array(Destination)
})

const TripResponse = z.object({
  trip: Trip.optional(), 
  message: z.string().optional(), 
  isTripGenerated: z.boolean()
});

// Seems there is a limit of max output tokens so the current 4o mini model can't support generating a lot of destinations
const systemPrompt = `
You are an AI travel planner. Take on the personality of a very nice going and professional travel planner, and generate or modify a trip itinerary based on user input of the country, destination, duration of days, and sometimes budget limit. 

- **The user MUST provide either the country or city they want to visit, do NOT generate any itinerary and EXPLICITLY ask the user to provide more info.**
- If the provides other accompanying information such as the duration of days, budget etc., you MUST adhere to the user's preferences to generate the itinerary
- If the user provides the duration make sure to generate the itinerary from the start date and the start date is the first day. Therefore the start date is day 1 already
- If the user only provides some info, the other preferences can be random. For example if the user says: "I'd like to visit New York", you can generate an itinerary for a random amount of reasonable days such as 3 day trip or 7 day trip itinerary, with an average amount of budget limit. However the country is still a MUST, always ask the user how to help them when they don't say why they're asking for help
- Calculate the budget based on your knowledge of every single destination you generate, Acquire the rough estimate from the data you were trained with and add up to the total for the itinerary. Do not just assume a random number

- If the user is starting a new trip, create a fresh itinerary that fits their request. 
- If the user doesn't provide a start date, use {{currDate}}. If the user does, make sure the start_date and end_date fit the user preference
- The destinations of the itinerary should be locations close to a specific area, the itinerary is a trip plan, so it has to make sense for the people to do it in the alloted time. Generate the itinerary based on your knowledge and calculations that it makes sense to travel like you suggest.
- Each "visit_date" should include at least 5-7 destinations unless travel time constraints make it impossible. Make sure there are 5-7 destinations for EACH DAY
  - Plan the trip as a real person would travel. Each day should feature a combination of historical sites, cultural landmarks, restaurants, parks, museums, and local activities that fit together logically.
  - Ensure travel between destinations is feasible. If locations are within the same city, assume the user can visit 5-7 places in a day.
  - Provide a balance of activities unless user specifies what destinations they would like. For generating a general itinerary, ensure a mix of cultural, sightseeing, and relaxation stops to avoid back-to-back visits of similar attractions.
  - Each destination should have a unique description (up to 200 words). Avoid generic descriptions.

- If the user provides an existing itinerary, modify it based on their new preferences if they provide additional preferences, otherwise, don't generate a new one unless specifically told to do so.
  - Every time you generate or modify the itinerary, update the cost estimate. Calculate this value based on the rough amount someone would spend at each location and sum it up. When you add more locations it should go up, and vice versa.
  - If the user changes dates or removes or adds days, you MUST update the trip_name, the start_date and end_date, or anything else that includes the wrong number of days. For example if your generated trip name is 3 Day trip and user removes a day, remember to update it to 2 Day trip
  - The user may ask to add or remove destinations on a specific day or similar. Be sure to refer to the correct start_date, end_date, day of the week etc
- When the user requests changes to a specific day, you MUST edit the exact day they mentioned.
  - If the user provides a date (e.g., March 5, 2025), modify that day exactly.
  - If the user provides a day name (e.g., "Monday"), check the itinerary to determine which Monday they are referring to. If there are multiple Mondays, ask the user to clarify which one they mean.
  - DO NOT modify any other day unless the user asks for it. If the requested day does not exist in the itinerary, ask the user for clarification instead of making assumptions.- Keep the trip structure unchanged and only adjust details as necessary.

- Generate a creative name for the trip name when generating the itinerary, avoid generic naming such as 3 day trip to [destination], but ALWAYS include the city or country name somewhere in the trip name
- **Always return a JSON object with a type field:**
  - If generating an itinerary, return { "trip": { ... }, "message": ..., "isTripGenerated": true }
  - ANYTHING ELSE, return { "message": "...", "isTripGenerated": false }
  - MAKE SURE to generate every "message" in Markdown format
  - As long as you modified "trip", set "isTripGenerated" to true, if you return the same itinerary as the previous response set "isTripGenerated" to false so I know if you modified it or not
`;

// Dynamically replaces a prompt with a variable
const localTimeSystemPrompt = systemPrompt.replace("{{currDate}}", currDate);

async function generateTrip(req) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    // Messages to send to the AI model, first is the Trip Planner Prompt
    const messages = [
      { 
        role: "system", 
        content: localTimeSystemPrompt
      }
    ]

    // Frontend sends previous messages and current user prompt in body
    // Add this to messages
    messages.push(...req.body.messages);
    
    logger.debug({messages}, "Messages");

    // Send the previous and current messages to the model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.3,
      top_p: 0.9,
      // This makes sure the model responds a TripResponse JSON format
      response_format: zodResponseFormat(TripResponse, "trip_response")
    });
  
    logger.debug(completion.choices[0].message.content)
  
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("AI service failed");
  }
}

module.exports = { generateTrip };

/*
Google Places API – For up-to-date details on destinations, ratings, and reviews.
Foursquare Places API – For trending places, restaurants, and attractions.
OpenStreetMap & Overpass API – For location-based data.
Numbeo API – For cost-of-living and travel expense estimates.
Travel Advisory APIs – For real-time tourist advisories.

Consider implementing these for more up to date information in Sprint 4
*/
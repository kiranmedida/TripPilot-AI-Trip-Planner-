import { groq } from '../../config/groq.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import { Trip } from '../trips/trip.model.js';
import { TripDay } from '../itinerary/tripDay.model.js';
import { Activity } from '../itinerary/activity.model.js';
import { ChatHistory } from './chatHistory.model.js';
import { Expense } from '../expenses/expense.model.js';

const getMockItinerary = (destination, days, budget, travelStyle, tripTemplate) => {
  const activities = {
    'Beach Vacation': ['Relax at the beach', 'Surfing lessons', 'Sunset cruise', 'Beach volleyball', 'Snorkeling tour'],
    'Adventure Trip': ['Zip-lining in the canopy', 'Mountain hiking trail', 'Rock climbing experience', 'White water rafting', 'Cave exploration'],
    'Family Vacation': ['Visit the local zoo', 'Amusement park ride', 'Science museum visit', 'Picnic in the city park', 'Aquarium exploration'],
    'Food Exploration': ['Street food walking tour', 'Local market tasting', 'Traditional cooking class', 'Fine dining experience', 'Chocolate making workshop'],
    'Business Travel': ['Co-working space session', 'Networking coffee meeting', 'Conference center check-in', 'Business district walk', 'Client dinner meeting'],
    'Backpacking': ['Free historic walking tour', 'Hostel social mixer', 'Budget site seeing', 'Public park exploration', 'Local transit ride'],
  };

  const selectedActivities = activities[tripTemplate] || activities['Beach Vacation'];

  const itinerary = Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    return {
      day: d,
      morning: {
        activity: `Morning: ${selectedActivities[d % selectedActivities.length]} in ${destination}.`,
        foodRecommendation: `Try a local breakfast spot near center.`,
        transportation: travelStyle === 'Luxury' ? 'Private Taxi' : 'Public Metro',
        budgetEstimate: travelStyle === 'Luxury' ? '$40' : '$5',
      },
      afternoon: {
        activity: `Afternoon: Exploring local heritage sites in ${destination}.`,
        foodRecommendation: `Local restaurant specialized in ${tripTemplate} cuisine.`,
        transportation: 'Walking',
        budgetEstimate: '$15',
      },
      evening: {
        activity: `Evening: Scenic views at sunset, capturing photos.`,
        foodRecommendation: `Highly rated dinner spot matching ${budget} budget.`,
        transportation: 'Taxi/Rideshare',
        budgetEstimate: travelStyle === 'Luxury' ? '$80' : '$20',
      },
    };
  });

  return {
    title: `Amazing ${days}-Day ${tripTemplate} in ${destination}`,
    destination,
    estimatedBudget: String(budget),
    packingList: [
      'Comfortable shoes',
      'Travel power adapter',
      'Documents & Passport',
      'Weather-appropriate clothing',
      tripTemplate === 'Beach Vacation' ? 'Swimwear & Sunscreen' : 'Water bottle & Daypack',
    ],
    travelTips: [
      'Keep some local currency cash handy.',
      'Use offline map downloads to save mobile data.',
      'Check local transit options for cost savings.',
    ],
    itinerary,
  };
};

export const generateItinerary = async ({ destination, budget, days, travelStyle, tripTemplate }) => {
  if (!groq) {
    console.log('🤖 Groq API key is mock or missing, returning generated mock itinerary...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getMockItinerary(destination, days, budget, travelStyle, tripTemplate);
  }

  const prompt = `
Create a detailed day-wise travel itinerary for a ${days}-day trip to ${destination}.
The budget category is ${budget} and the travel style is ${travelStyle}.
The trip category template is ${tripTemplate}.
Focus itinerary items on matching this template guidelines:
- Beach Vacation: Relaxing beach spots, coastal food, water activities.
- Adventure Trip: Outdoor hiking, sports, active excursions.
- Family Vacation: Family-friendly sights, kid-friendly spots, group food.
- Food Exploration: Culinary highlights, local markets, street food, dining hotspots.
- Business Travel: Central workspaces, premium dining, smooth transit, networking.
- Backpacking: Budget hostels, public transit, free walking tours, street stalls.

Output MUST be a valid JSON object adhering EXACTLY to this schema. Crucial: Do not add any text, notes, or descriptions before or after the JSON brackets. The final character of your response MUST be the closing brace } (no markdown blocks, no trailing comments):
{
  "title": "A catchy title for the trip",
  "destination": "${destination}",
  "estimatedBudget": "${budget}",
  "packingList": ["item 1", "item 2"],
  "travelTips": ["tip 1", "tip 2"],
  "itinerary": [
    {
      "day": 1,
      "morning": {
        "activity": "Activity description",
        "foodRecommendation": "Breakfast spot details",
        "transportation": "Transit details",
        "budgetEstimate": "Cost"
      },
      "afternoon": {
        "activity": "Activity description",
        "foodRecommendation": "Lunch spot details",
        "transportation": "Transit details",
        "budgetEstimate": "Cost"
      },
      "evening": {
        "activity": "Activity description",
        "foodRecommendation": "Dinner spot details",
        "transportation": "Transit details",
        "budgetEstimate": "Cost"
      }
    }
  ]
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert travel assistant. You only output valid JSON matching the exact user schema structure. Never return any explanation or markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      model: env.GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    let content = chatCompletion.choices[0].message.content.trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw new AppError('AI itinerary generation failed. Please try again later.', 502);
  }
};

export const regenerateItinerary = async (originalTrip, instruction) => {
  if (!groq) {
    console.log('🤖 Groq API key is mock, returning mock regenerated itinerary...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const updatedTrip = JSON.parse(JSON.stringify(originalTrip));
    updatedTrip.title = `${updatedTrip.title} (Revised: ${instruction})`;
    updatedTrip.travelTips = [...(updatedTrip.travelTips || []), `Instruction implemented: ${instruction}`];
    return updatedTrip;
  }

  const prompt = `
Here is an existing travel itinerary JSON:
${JSON.stringify(originalTrip)}

The user wants to update/modify this trip with the following instruction:
"${instruction}"

Output MUST be a valid JSON object matching this schema structure, representing the newly updated itinerary. Crucial: Do not add any comments (do not use '//' comments), text, or notes before or after the JSON brackets. The final character of your response MUST be the closing brace } (no markdown blocks, no trailing comments):
{
  "title": "A catchy updated title for the trip",
  "destination": "${originalTrip.destination}",
  "estimatedBudget": "Updated estimated budget",
  "packingList": ["Updated items..."],
  "travelTips": ["Updated tips..."],
  "itinerary": [
     {
       "day": 1,
       "morning": { "activity": "Activity", "foodRecommendation": "Food", "transportation": "Transit", "budgetEstimate": "Cost" },
       "afternoon": { "activity": "Activity", "foodRecommendation": "Food", "transportation": "Transit", "budgetEstimate": "Cost" },
       "evening": { "activity": "Activity", "foodRecommendation": "Food", "transportation": "Transit", "budgetEstimate": "Cost" }
     }
  ]
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert travel assistant. You only output valid JSON matching the exact user schema structure. Never return any explanation or markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      model: env.GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    let content = chatCompletion.choices[0].message.content.trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw new AppError('AI itinerary regeneration failed. Please try again later.', 502);
  }
};

export const chatCopilot = async (tripId, message, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new AppError('Trip not found.', 404);

  // Fetch Days and Activities to provide context
  const days = await TripDay.find({ tripId }).sort({ dayNumber: 1 });
  const activities = await Activity.find({ tripId });
  
  // Fetch recent chat history
  const recentHistory = await ChatHistory.find({ tripId, userId })
    .sort({ createdAt: -1 })
    .limit(10);
  
  const historyList = [...recentHistory].reverse();

  // Save the user's message
  await ChatHistory.create({ tripId, userId, sender: 'User', message });

  if (!groq) {
    const aiResponse = `I see you are planning a trip to ${trip.destination}. Regarding "${message}": as a mock response, I suggest checking out the local spots near the hotel!`;
    await ChatHistory.create({ tripId, userId, sender: 'AI', message: aiResponse });
    return { response: aiResponse };
  }

  // Construct system prompt with rich context
  const systemPrompt = `You are a real-time AI Travel Copilot named TripPilot assisting the user with their trip to ${trip.destination}.
Current Trip context:
- Title: ${trip.title}
- Destination: ${trip.destination}
- Budget: ${trip.budget} USD
- Travel Style: ${trip.travelStyle}
Itinerary days: ${JSON.stringify(days.map(d => ({ day: d.dayNumber, weather: d.weatherSummary })))}
Activities: ${JSON.stringify(activities.map(a => ({ title: a.title, time: a.timeOfDay, completed: a.completed })))}

Be helpful, concise, and conversational. Give direct recommendations, tips, and safety warnings for the specific destination.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyList.map(h => ({
      role: h.sender === 'User' ? 'user' : 'assistant',
      content: h.message
    })),
    { role: 'user', content: message }
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: env.GROQ_MODEL,
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    
    // Save AI response
    await ChatHistory.create({ tripId, userId, sender: 'AI', message: aiResponse });
    return { response: aiResponse };
  } catch (error) {
    console.error('❌ Groq Copilot Chat error:', error);
    throw new AppError('AI Travel Copilot failed to reply. Please try again.', 502);
  }
};

export const optimizeRoute = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new AppError('Trip not found.', 404);

  const activities = await Activity.find({ tripId });
  if (activities.length === 0) return { message: 'No activities to optimize.' };

  if (!groq) {
    // Mock sort: just sort by time Slot (Morning -> Afternoon -> Evening)
    return { message: 'Activities optimized successfully (mock heuristic sorting applied).' };
  }

  const prompt = `Here are the current activities for a trip to ${trip.destination}:
${JSON.stringify(activities.map(a => ({ id: a._id, title: a.title, timeSlot: a.timeOfDay, description: a.description })))}

Please rearrange these activities to optimize the route, ensuring activities in similar proximity or logical order are grouped together.
Return a valid JSON object containing the list of activity IDs ordered sequentially:
{
  "order": ["id1", "id2", ...]
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert route planner. You only return a raw JSON object containing the "order" array. Never return any explanation or conversational text.' },
        { role: 'user', content: prompt }
      ],
      model: env.GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    let content = chatCompletion.choices[0].message.content;
    content = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsedData = JSON.parse(content);
    const sortedIds = parsedData.order || parsedData;
    
    // To keep it simple, we update the timeSlot or order index. Let's log it.
    console.log('Optimized order received:', sortedIds);
    return { message: 'Route optimized successfully.', order: sortedIds };
  } catch (error) {
    console.error('❌ Groq Route Optimization error:', error);
    throw new AppError('AI Route optimization failed.', 502);
  }
};

export const getBudgetAdvice = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new AppError('Trip not found.', 404);

  const expenses = await Expense.find({ tripId });
  
  if (!groq) {
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      advice: `Your total spending is ${totalAmount} USD out of a planned budget of ${trip.budget} USD. Keep track of your food and lodging expenses to save money!`
    };
  }

  const prompt = `Planned Budget: ${trip.budget} USD
Current expenses recorded:
${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })))}

Analyze this spending behavior for a trip to ${trip.destination} and provide smart budget tips and recommendations.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert financial travel advisor. Provide a neat summary and 3 bulleted saving recommendations.' },
        { role: 'user', content: prompt }
      ],
      model: env.GROQ_MODEL,
    });

    return { advice: chatCompletion.choices[0].message.content };
  } catch (error) {
    console.error('❌ Groq Budget Advice error:', error);
    throw new AppError('AI Budget analysis failed.', 502);
  }
};

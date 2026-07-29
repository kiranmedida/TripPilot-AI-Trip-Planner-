import { groq } from '../config/groq.js';
import { AppError } from '../utils/appError.js';

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
    estimatedBudget: budget,
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
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

Output MUST be a JSON object adhering EXACTLY to this schema (no markdown, no outer text wrappers, no 'json' code block ticks, only the raw JSON payload):
{
  "title": "A catchy title for the trip",
  "destination": "${destination}",
  "estimatedBudget": "${budget}",
  "packingList": ["item 1", "item 2", ...],
  "travelTips": ["tip 1", "tip 2", ...],
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
      model: process.env.GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw new AppError('AI itinerary generation failed. Please try again later.', 502);
  }
};

export const regenerateItinerary = async (originalTrip, instruction) => {
  if (!groq) {
    console.log('🤖 Groq API key is mock, returning mock regenerated itinerary...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const updatedTrip = JSON.parse(JSON.stringify(originalTrip));
    updatedTrip.title = `${updatedTrip.title} (Revised: ${instruction})`;
    updatedTrip.budget = instruction.toLowerCase().includes('budget') ? 'Low Budget (Revised)' : updatedTrip.budget;
    updatedTrip.travelTips = [...updatedTrip.travelTips, `Instruction implemented: ${instruction}`];
    return updatedTrip;
  }

  const prompt = `
Here is an existing travel itinerary JSON:
${JSON.stringify(originalTrip)}

The user wants to update/modify this trip with the following instruction:
"${instruction}"

Output MUST be a JSON object matching this schema structure, representing the newly updated itinerary (do not return any other conversational response, no explaining, and no markdown tags):
{
  "title": "A catchy updated title for the trip",
  "destination": "${originalTrip.destination}",
  "estimatedBudget": "Updated estimated budget",
  "packingList": ["Updated items..."],
  "travelTips": ["Updated tips..."],
  "itinerary": [
     // Same array size representing daily plan matching previous itinerary, updated based on instruction
  ]
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert travel assistant. You only output valid JSON matching the exact user schema structure. Never return any explanation or markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      model: process.env.GROQ_MODEL,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw new AppError('AI itinerary regeneration failed. Please try again later.', 502);
  }
};

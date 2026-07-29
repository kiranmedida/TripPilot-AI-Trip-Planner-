import { regenerateItinerary } from '../src/modules/ai/ai.service.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dummyTrip = {
  title: "Trip to Tokyo",
  destination: "Tokyo, Japan",
  budget: 2000,
  days: 2,
  travelStyle: "Casual",
  tripTemplate: "City Exploration",
  packingList: ["Shoes", "Camera"],
  travelTips: ["Get a Suica card"],
  itinerary: [
    {
      day: 1,
      morning: { activity: "Visit Sensoji Temple", foodRecommendation: "Street food", transportation: "Metro", budgetEstimate: "10" },
      afternoon: { activity: "Explore Akihabara", foodRecommendation: "Ramen", transportation: "Walking", budgetEstimate: "15" },
      evening: { activity: "Shibuya Crossing", foodRecommendation: "Sushi", transportation: "Metro", budgetEstimate: "30" }
    }
  ]
};

console.log("Running AI regeneration with instruction: 'Change Day 1 evening activity to Omoide Yokocho'...");

regenerateItinerary(dummyTrip, "Change Day 1 evening activity to Omoide Yokocho")
  .then(result => {
    console.log("✅ Success! Response JSON:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error("❌ Failed! Error stack:");
    console.error(err);
  });

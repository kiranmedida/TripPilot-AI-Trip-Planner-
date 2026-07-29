import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Trip } from '../src/modules/trips/trip.model.js';
import { TripDay } from '../src/modules/itinerary/tripDay.model.js';
import { Activity } from '../src/modules/itinerary/activity.model.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const tripId = '6a6a42a29ee10b498d109cc5';
  
  const updatedItinerary = {
    title: "Sun & Serenity: A Relaxing 3-Day Beach Escape with Scuba Adventure",
    estimatedBudget: "1200",
    packingList: ["Sunscreen", "Swimwear", "Light jacket", "Sunglasses", "Reusable water bottle", "Comfortable shoes", "Camera", "Dive mask"],
    travelTips: ["Arrive early to secure beach parking", "Use sunscreen SPF 50", "Stay hydrated", "Try local seafood", "Avoid peak traffic hours", "Carry a copy of ID", "Book scuba gear in advance"],
    itinerary: [
      {
        day: 1,
        morning: { activity: "Morning stroll along South Beach", foodRecommendation: "Breakfast club", transportation: "Walk", budgetEstimate: "15" },
        afternoon: { activity: "Kayak out on Lummus Park", foodRecommendation: "Snack bar", transportation: "Walk", budgetEstimate: "20" },
        evening: { activity: "Sunset on the pier", foodRecommendation: "Seafood dinner", transportation: "Taxi", budgetEstimate: "50" }
      },
      {
        day: 2,
        morning: { activity: "Scuba diving at Miami Beach reefs", foodRecommendation: "Post-dive brunch", transportation: "Boat", budgetEstimate: "150" },
        afternoon: { activity: "Paddleboarding at South Pointe", foodRecommendation: "Juice bar", transportation: "Walk", budgetEstimate: "25" },
        evening: { activity: "Walk on Ocean Drive", foodRecommendation: "Dinner at Broken Shaker", transportation: "Walk", budgetEstimate: "60" }
      },
      {
        day: 3,
        morning: { activity: "Early ferry to Key Biscayne", foodRecommendation: "Picnic basket", transportation: "Ferry", budgetEstimate: "40" },
        afternoon: { activity: "Snorkeling at Crandon Park", foodRecommendation: "Beach picnic", transportation: "Walk", budgetEstimate: "15" },
        evening: { activity: "Farewell dinner on Ocean Drive", foodRecommendation: "Rooftop dining", transportation: "Taxi", budgetEstimate: "80" }
      }
    ]
  };

  try {
    const trip = await Trip.findById(tripId);
    console.log("Found trip:", trip.title);

    // Save core trip record details
    trip.title = updatedItinerary.title || trip.title;
    trip.budget = parseFloat(String(updatedItinerary.estimatedBudget || updatedItinerary.budget || trip.budget).replace(/[^0-9.]/g, '')) || 0;
    trip.packingList = (updatedItinerary.packingList || []).map(item => 
      typeof item === 'string' ? { item, packed: false } : item
    );
    trip.travelTips = updatedItinerary.travelTips || trip.travelTips;
    await trip.save();
    console.log("Saved trip title and metadata.");

    console.log("Deleting days and activities...");
    const delDays = await TripDay.deleteMany({ tripId });
    const delActs = await Activity.deleteMany({ tripId });
    console.log(`Deleted ${delDays.deletedCount} days and ${delActs.deletedCount} activities.`);

    const itinerary = updatedItinerary.itinerary || [];
    for (const dayObj of itinerary) {
      const dayNum = dayObj.day || dayObj.dayNumber;
      console.log(`Creating TripDay for day ${dayNum}...`);
      const tripDay = await TripDay.create({
        tripId,
        dayNumber: dayNum,
        date: dayObj.date || null,
        weatherSummary: dayObj.weatherSummary || {},
      });

      const times = ['morning', 'afternoon', 'evening'];
      for (const time of times) {
        const act = dayObj[time];
        if (act) {
          console.log(`  Creating Activity for ${time}...`);
          await Activity.create({
            tripId,
            dayId: tripDay._id,
            timeOfDay: time.charAt(0).toUpperCase() + time.slice(1),
            activity: act.activity || 'Relax and explore',
            foodRecommendation: act.foodRecommendation || '',
            transportation: act.transportation || '',
            budgetEstimate: parseFloat(String(act.budgetEstimate || '').replace(/[^0-9.]/g, '')) || 0,
            completed: act.completed || false,
          });
        }
      }
    }
    console.log("🎉 Rebuild complete!");
  } catch (err) {
    console.error("❌ DB Rebuild Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

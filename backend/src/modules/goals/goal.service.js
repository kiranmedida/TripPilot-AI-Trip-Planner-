import { Goal } from './goal.model.js';
import { Achievement } from './achievement.model.js';
import { User } from '../users/user.model.js';
import { Trip } from '../trips/trip.model.js';
import { AppError } from '../../utils/appError.js';

export const getUserGoals = async (userId) => {
  // Initialize default goals if none exist for the user
  const count = await Goal.countDocuments({ userId });
  if (count === 0) {
    await Goal.create([
      { userId, title: 'Plan 3 Trips', targetValue: 3, currentValue: 0, type: 'Visits', completed: false },
      { userId, title: 'Maintain a 5-day Streak', targetValue: 5, currentValue: 0, type: 'Streak', completed: false },
      { userId, title: 'Record $100 in Expenses', targetValue: 100, currentValue: 0, type: 'Expenses', completed: false },
    ]);
  }
  return await Goal.find({ userId });
};

export const getUserAchievements = async (userId) => {
  return await Achievement.find({ userId }).sort({ unlockedAt: -1 });
};

export const evaluateGoalsAndAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  const tripsCount = await Trip.countDocuments({ userId });
  
  // Update Goals progress
  const goals = await Goal.find({ userId, completed: false });
  let earnedXP = 0;
  
  for (const goal of goals) {
    if (goal.type === 'Visits') {
      goal.currentValue = tripsCount;
    } else if (goal.type === 'Streak') {
      goal.currentValue = user.streakCount || 0;
    }
    
    if (goal.currentValue >= goal.targetValue) {
      goal.completed = true;
      earnedXP += 100; // Award 100 XP per completed goal
    }
    await goal.save();
  }

  // Check achievements
  const achievements = await Achievement.find({ userId });
  const unlockedBadges = achievements.map(a => a.badgeCode);
  const newAchievements = [];

  const checkUnlock = async (badgeCode, title, condition) => {
    if (!unlockedBadges.includes(badgeCode) && condition) {
      const ach = await Achievement.create({ userId, badgeCode, title });
      newAchievements.push(ach);
      earnedXP += 200; // Award 200 XP per achievement unlocked
    }
  };

  // 1. World Explorer (planned at least 1 trip)
  await checkUnlock('world_explorer', 'World Explorer - Planned your first trip', tripsCount >= 1);
  // 2. Beach Explorer (has a beach vacation template)
  const beachTrip = await Trip.findOne({ userId, tripTemplate: /Beach/i });
  await checkUnlock('beach_explorer', 'Beach Explorer - Planned a beach getaway', !!beachTrip);
  // 3. Level 5
  await checkUnlock('level_5', 'Level 5 Globetrotter - Reached level 5', user.level >= 5);
  // 4. Dedicated Planner (planned 3 trips)
  await checkUnlock('dedicated_planner', 'Dedicated Planner - Created 3 trip plans', tripsCount >= 3);

  if (earnedXP > 0) {
    user.xp += earnedXP;
    // Recalculate level
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();
  }

  return {
    goals: await Goal.find({ userId }),
    newAchievements,
    xpEarned: earnedXP,
    level: user.level,
    xp: user.xp,
  };
};

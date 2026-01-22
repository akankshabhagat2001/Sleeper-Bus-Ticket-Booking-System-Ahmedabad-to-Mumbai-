
import { PredictionFeatures } from '../types';

/**
 * MOCK PREDICTION LOGIC
 * Prediction Approach: 
 * We use a Weighted Factor Analysis (simulating a Logistic Regression model).
 * The probability of a booking being confirmed/not-canceled depends on:
 * 1. Lead Time: Bookings closer to the trip date are less likely to cancel.
 * 2. Day of Week: Weekend bookings (Fri-Sun) have higher demand and slightly higher stability.
 * 3. Occupancy: High bus occupancy increases perceived value and decreases cancellation likelihood.
 */

export const predictConfirmationProbability = (features: PredictionFeatures): number => {
  const { leadTimeDays, dayOfWeek, currentOccupancy } = features;

  // Base probability
  let probability = 75;

  // Impact of lead time (Inverse relationship with cancellation)
  // If you book 1 day before, it's 95% likely you'll go.
  // If you book 30 days before, there's more chance life happens.
  probability += (30 - Math.min(leadTimeDays, 30)) * 0.5;

  // Impact of Day of Week (0-6, where 5=Fri, 6=Sat)
  if (dayOfWeek >= 5 || dayOfWeek === 0) {
    probability += 5; // Weekends are popular
  }

  // Impact of Occupancy (Scarcity heuristic)
  probability += (currentOccupancy / 100) * 10;

  // Clamp results
  return Math.min(Math.max(probability, 50), 99);
};

export const PREDICTION_DOCS = {
  model: "Simulated Logistic Regression (Weighted Feature Scoring)",
  approach: "Analyzes lead time, temporal demand (weekday/weekend), and bus occupancy metrics.",
  mockDataset: [
    { leadTime: 2, day: "Sat", occupancy: 0.85, status: "Confirmed", probability: 0.94 },
    { leadTime: 15, day: "Tue", occupancy: 0.40, status: "Cancelled", probability: 0.72 },
    { leadTime: 1, day: "Mon", occupancy: 0.95, status: "Confirmed", probability: 0.98 },
  ]
};

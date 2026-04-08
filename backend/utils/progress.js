// backend/utils/progress.js (REPLACE FULL FILE)

import Progress from "../models/Progress.js";

export async function updateProgress(userId, emotion, severity) {
  let userProgress = await Progress.findOne({ userId });

  if (!userProgress) {
    userProgress = new Progress({
      userId,
      emotions: [],
      severity: [],
      entries: [],
    });
  }

  userProgress.emotions.push(emotion);
  userProgress.severity.push(severity);

  // New timestamped entry for better analytics.
  userProgress.entries.push({
    emotion,
    severity,
    recordedAt: new Date(),
  });

  // Keep arrays bounded.
  if (userProgress.entries.length > 500) {
    userProgress.entries = userProgress.entries.slice(-500);
  }
  if (userProgress.emotions.length > 500) {
    userProgress.emotions = userProgress.emotions.slice(-500);
  }
  if (userProgress.severity.length > 500) {
    userProgress.severity = userProgress.severity.slice(-500);
  }

  await userProgress.save();

  return userProgress;
}

export async function getProgress(userId) {
  const userProgress = await Progress.findOne({ userId });

  if (!userProgress) {
    return {
      emotions: [],
      severity: [],
      entries: [],
    };
  }

  return {
    userId: userProgress.userId,
    emotions: userProgress.emotions || [],
    severity: userProgress.severity || [],
    entries: userProgress.entries || [],
  };
}
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GAME_PROGRESS_KEY = "WEREWOLF_SAVE";
export const GAME_PROGRESS_KEY_DEV = "WEREWOLF_SAVE_DEV";
export const APP_SETTINGS_KEY = "WEREWOLF_SETTINGS";

function getProgressKey(devMode, userId) {
  const base = devMode ? GAME_PROGRESS_KEY_DEV : GAME_PROGRESS_KEY;
  return userId != null ? `${base}_user_${userId}` : base;
}

const DIFFICULTY_POINTS = {
  beginner: 80,
  easy: 120,
  normal: 160,
  hard: 220,
  expert: 300,
  insane: 400,
};

const ROUND_TIME_BONUS_SECONDS = 120;
const CLEAN_PLAY_BONUS = 45;
const LOSS_PENALTY_MIN = 150;
const LOSS_PENALTY_MULTIPLIER = 1.25;

export function calculateRoundScore({
  levelKey,
  elapsedSeconds,
  mistakes,
  maxMistakes,
}) {
  const difficultyPoints =
    DIFFICULTY_POINTS[levelKey] ?? DIFFICULTY_POINTS.easy;
  const timeBonus = Math.max(0, ROUND_TIME_BONUS_SECONDS - elapsedSeconds) * 2;
  const mistakesAvoided = Math.max(0, maxMistakes - mistakes);
  const cleanPlayBonus = mistakesAvoided * CLEAN_PLAY_BONUS;
  const roundPoints = difficultyPoints + timeBonus + cleanPlayBonus;

  return {
    difficultyPoints,
    timeBonus,
    cleanPlayBonus,
    mistakesAvoided,
    roundPoints,
  };
}

export function finalizeScoreForRound({
  currentScore,
  levelKey,
  elapsedSeconds,
  mistakes,
  maxMistakes,
  resultType,
}) {
  const breakdown = calculateRoundScore({
    levelKey,
    elapsedSeconds,
    mistakes,
    maxMistakes,
  });
  const penalty = 0;
  const scoreChange =
    resultType === "win" ? breakdown.roundPoints : -currentScore;
  const nextScore =
    resultType === "win" ? currentScore + breakdown.roundPoints : 0;

  return {
    ...breakdown,
    penalty,
    scoreChange,
    nextScore,
  };
}

export function buildRoundSummary({
  levelKey,
  resultType,
  elapsedSeconds,
  currentScore,
  nextScore,
  scoreChange,
  difficultyPoints,
  timeBonus,
  cleanPlayBonus,
  mistakesAvoided,
  roundPoints,
  penalty,
}) {
  return {
    levelKey,
    resultType,
    elapsedSeconds,
    currentScore,
    nextScore,
    scoreChange,
    difficultyPoints,
    timeBonus,
    cleanPlayBonus,
    mistakesAvoided,
    roundPoints,
    penalty,
  };
}

export async function loadGameProgress(devMode = false, userId = null) {
  const key = getProgressKey(devMode, userId);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveGameProgress(progress, devMode = false, userId = null) {
  const key = getProgressKey(devMode, userId);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(progress));
    return progress;
  } catch {
    return null;
  }
}

export async function clearGameProgress(devMode = false, userId = null) {
  const key = getProgressKey(devMode, userId);
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

export async function loadAppSettings() {
  try {
    const raw = await AsyncStorage.getItem(APP_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveAppSettings(settings) {
  try {
    await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  } catch {
    return null;
  }
}

export async function resetSavedScore(devMode = false, userId = null) {
  const currentProgress = await loadGameProgress(devMode, userId);
  if (!currentProgress) return null;

  const nextProgress = {
    ...currentProgress,
    score: 0,
    summary: null,
  };

  await saveGameProgress(nextProgress, devMode, userId);
  return nextProgress;
}

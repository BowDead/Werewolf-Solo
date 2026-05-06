// ─────────────────────────────────────────────────────────────
//  DIFFICULTIES
// ─────────────────────────────────────────────────────────────
export const DIFFICULTIES = {
  easy: {
    key: "easy",
    title: "Easy",
    description: "5 characters • 1 werewolf • 2 mistakes",
    characterCount: 5,
    gridCols: 3,
    werewolfCount: 1,
    corruptedCount: 0,
    maxMistakes: 2,
  },
  medium: {
    key: "medium",
    title: "Medium",
    description: "7 characters • 2 werewolves • 1 corrupted • 1 mistake",
    characterCount: 7,
    gridCols: 3,
    werewolfCount: 2,
    corruptedCount: 1,
    maxMistakes: 3,
  },
  hard: {
    key: "hard",
    title: "Hard",
    description: "9 characters • 3 werewolves • 1 corrupted • 1 mistake",
    characterCount: 9,
    gridCols: 3,
    werewolfCount: 3,
    corruptedCount: 1,
    maxMistakes: 3,
  },
};

// progression order
export const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

// ─────────────────────────────────────────────────────────────
//  PROFESSIONS
// ─────────────────────────────────────────────────────────────
export const PROFESSIONS = [
  "Blacksmith",
  "Baker",
  "Mayor",
  "Hunter",
  "Miller",
  "Gardener",
  "Fisherman",
  "Barman",
  "Carpenter",
  "Miner",
];

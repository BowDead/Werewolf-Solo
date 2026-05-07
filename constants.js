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
  normal: {
    key: "normal",
    title: "Normal",
    description: "7 characters • 2 werewolves • 1 corrupted • 2 mistakes",
    characterCount: 7,
    gridCols: 3,
    werewolfCount: 2,
    corruptedCount: 1,
    maxMistakes: 2,
  },
  hard: {
    key: "hard",
    title: "Hard",
    description: "9 characters • 3 werewolves • 1 corrupted • 1 mistake",
    characterCount: 9,
    gridCols: 3,
    werewolfCount: 3,
    corruptedCount: 1,
    maxMistakes: 1,
  },
  expert: {
    key: "expert",
    title: "Expert",
    description: "11 characters • 4 werewolves • 1 corrupted • 1 mistake",
    characterCount: 11,
    gridCols: 3,
    werewolfCount: 4,
    corruptedCount: 1,
    maxMistakes: 1,
  },
  insane: {
    key: "insane",
    title: "Insane",
    description: "13 characters • 5 werewolves • 0 mistakes",
    characterCount: 13,
    gridCols: 3,
    werewolfCount: 5,
    corruptedCount: 0,
    maxMistakes: 0,
  },
};

// progression order
export const DIFFICULTY_ORDER = ["easy", "normal", "hard", "expert", "insane"];

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

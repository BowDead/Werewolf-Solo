import { DIFFICULTIES, PROFESSIONS } from "./constants";
import { ROLES } from "./roles";
import { shuffle, doesLie, getGridNeighbours } from "./utils";

export { shuffle, doesLie, getGridNeighbours };

const neighbourFraction = 0.4;

function buildRolePool(characterCount) {
  const targetSize = Math.max(1, characterCount);

  // Determine which roles are active/implemented
  const activeRoles = Object.keys(ROLES).filter((r) => ROLES[r].active);

  const pool = [];

  // Prefer one confessor and one watchman if available
  if (ROLES.confessor && ROLES.confessor.active) pool.push("confessor");
  if (ROLES.watchman && ROLES.watchman.active) pool.push("watchman");

  // Fill remaining slots preferring neighbour -> witness -> president -> any active role
  const preferred = ["neighbour", "witness", "president"];

  while (pool.length < targetSize) {
    // build candidate list based on preference and availability
    const candidates = [];
    for (const p of preferred) {
      if (ROLES[p] && ROLES[p].active) {
        candidates.push(p);
      }
    }

    // If no preferred roles available, fall back to any active role
    if (candidates.length === 0) {
      if (activeRoles.length === 0) {
        // As a last resort, use confessor (shouldn't happen)
        candidates.push("confessor");
      } else {
        candidates.push(...activeRoles);
      }
    }

    // pick a random candidate and add to pool
    const pick = shuffle(candidates)[0];
    pool.push(pick);
  }

  return shuffle(pool).slice(0, targetSize);
}

export function createGame(levelKey) {
  const config = DIFFICULTIES[levelKey];

  const selectedProfessions = shuffle(PROFESSIONS).slice(
    0,
    config.characterCount,
  );

  const statePool = [
    ...Array(config.werewolfCount).fill("werewolf"),
    ...Array(config.corruptedCount).fill("villager_corrupted"),
    ...Array(
      config.characterCount - config.werewolfCount - config.corruptedCount,
    ).fill("villager"),
  ];

  const states = shuffle(statePool);
  const roles = buildRolePool(config.characterCount);

  const characters = selectedProfessions.map((profession, index) => ({
    id: index,
    position: {
      col: index % config.gridCols,
      row: Math.floor(index / config.gridCols),
    },
    profession,
    role: roles[index],
    state: states[index],
    accused: false,
    statement: "",
  }));

  const withStatements = characters.map((speaker) => {
    const roleDef = ROLES[speaker.role];
    const statement = roleDef ? roleDef.generate(speaker, characters) : "";
    return { ...speaker, statement };
  });

  return {
    levelKey,
    config,
    characters: withStatements,
    mistakes: 0,
    foundThreats: 0,
    totalThreats: config.werewolfCount,
    result: null,
  };
}

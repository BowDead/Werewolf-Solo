import { DIFFICULTIES, PROFESSIONS } from "./constants";
import { ROLE_ROLL_CHANCES, ROLES } from "./roles";
import { shuffle, doesLie, getGridNeighbours } from "./utils";

export { shuffle, doesLie, getGridNeighbours };

function pickWeightedRole(activeRoles) {
  const weightedPool = activeRoles.flatMap((role) => {
    const chance = ROLE_ROLL_CHANCES[role] ?? 1;
    return Array.from({ length: chance }, () => role);
  });

  if (!weightedPool.length) {
    return "confessor";
  }

  return shuffle(weightedPool)[0];
}

function buildRolePoolByState(states, allowedRoles) {
  const activeRoles = Object.keys(ROLES)
    .filter((r) => ROLES[r].active)
    .filter((r) => !allowedRoles || allowedRoles.includes(r));
  if (activeRoles.length === 0) {
    return Array(states.length).fill("confessor");
  }

  const roles = Array(states.length).fill(activeRoles[0]);

  const villagerLikeIndexes = [];
  const werewolfIndexes = [];

  states.forEach((state, index) => {
    if (state === "werewolf") {
      werewolfIndexes.push(index);
      return;
    }
    villagerLikeIndexes.push(index);
  });

  // Villagers + corrupted villagers: draw from the weighted table.
  villagerLikeIndexes.forEach((index) => {
    roles[index] = pickWeightedRole(activeRoles);
  });

  // Werewolves: random roles with a slight chance to repeat a role already seen.
  const repeatChance = 0.3;
  const villagerLikeRoles = villagerLikeIndexes.map((index) => roles[index]);
  const werewolfAssignedRoles = [];
  shuffle([...werewolfIndexes]).forEach((index) => {
    let chosenRole;

    if (Math.random() < repeatChance) {
      const repeatPool = [...werewolfAssignedRoles, ...villagerLikeRoles];
      chosenRole = repeatPool.length
        ? shuffle(repeatPool)[0]
        : pickWeightedRole(activeRoles);
    } else {
      chosenRole = pickWeightedRole(activeRoles);
    }

    roles[index] = chosenRole;
    werewolfAssignedRoles.push(chosenRole);
  });

  return roles;
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
  const roles = buildRolePoolByState(states, config.allowedRoles);

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
    marks: {},
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
    startedAt: Date.now(),
    mistakes: 0,
    foundThreats: 0,
    totalThreats: config.werewolfCount,
    result: null,
  };
}

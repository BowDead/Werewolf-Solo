import { DIFFICULTIES, PROFESSIONS } from "./constants";
import { ROLES } from "./roles";
import { shuffle, doesLie, getGridNeighbours } from "./utils";

export { shuffle, doesLie, getGridNeighbours };

function buildRolePoolByState(states) {
  const activeRoles = Object.keys(ROLES).filter((r) => ROLES[r].active);
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

  // Villagers + corrupted villagers: distribute random roles without repeats first.
  let cycle = shuffle([...activeRoles]);
  villagerLikeIndexes.forEach((index, i) => {
    if (i > 0 && i % activeRoles.length === 0) {
      cycle = shuffle([...activeRoles]);
    }
    roles[index] = cycle[i % activeRoles.length];
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
        : shuffle([...activeRoles])[0];
    } else {
      chosenRole = shuffle([...activeRoles])[0];
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
  const roles = buildRolePoolByState(states);

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
    startedAt: Date.now(),
    mistakes: 0,
    foundThreats: 0,
    totalThreats: config.werewolfCount,
    result: null,
  };
}

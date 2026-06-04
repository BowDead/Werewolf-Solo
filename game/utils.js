// ─────────────────────────────────────────────────────────────
//  UTILS  — no imports from other game files
// ─────────────────────────────────────────────────────────────

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Single source of truth for the lie rule.
 * "villager_corrupted" looks like a villager but always lies.
 */
export function doesLie(character) {
  return (
    character.state === "werewolf" || character.state === "villager_corrupted"
  );
}

/**
 * Returns characters directly adjacent (4-directional, no diagonals)
 * to `speaker` on the grid.
 */
export function getGridNeighbours(speaker, allChars) {
  const { col, row } = speaker.position;
  const adjacent = [
    { col: col - 1, row },
    { col: col + 1, row },
    { col, row: row - 1 },
    { col, row: row + 1 },
  ];
  return allChars.filter(
    (c) =>
      c.id !== speaker.id &&
      adjacent.some(
        (pos) => pos.col === c.position.col && pos.row === c.position.row,
      ),
  );
}

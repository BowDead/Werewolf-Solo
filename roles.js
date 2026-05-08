import { doesLie, getGridNeighbours, randomFrom } from "./utils";

function isWerewolfLike(character) {
  return character.state === "werewolf" || character.role === "recluse";
}

// ─────────────────────────────────────────────────────────────
//  ROLES
//
//  Each role has:
//    generate(speaker, allChars) → string
//
//  STATE drives truth/lies — never hardcode it inside a role.
//  Use doesLie(speaker) for the lie check everywhere.
//
//  ROLE describes what kind of information the character shares.
//  Roles are intentionally hidden from the player on the UI -
//  only the information is shown.
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  /**
   * Speaks only about themselves.
   *   villager          → "Jestem niewinny."
   *   werewolf/corrupted → "Czuje sie winny."
   *
   * NOTE: for a werewolf this is actually true (they ARE guilty),
   * so the confessor role is unique — a werewolf-confessor
   * accidentally tells the truth by lying about innocence.
   * The corrupted variant appends a hidden tag for debugging.
   */
  confessor: {
    active: true,
    generate(speaker) {
      if (doesLie(speaker)) {
        return `I feel guilty.`;
      }
      return "I am innocent.";
    },
  },

  /**
   * PRESIDENT
   * Always says the same line, regardless of alignment.
   * Special accusation handling for this role is implemented in GameMode.
   */
  president: {
    active: true,
    generate() {
      return "I cannot be accused.";
    },
  },

  /**
   * DOCTOR
   * Reports how many corrupted characters are adjacent (orthogonal only).
   * Lying variants report a random wrong count, biased toward 0 or 1.
   */
  doctor: {
    active: true,
    generate(speaker, allChars) {
      const neighbours = getGridNeighbours(speaker, allChars);
      const corruptedCount = neighbours.filter(
        (c) => c.state === "villager_corrupted",
      ).length;

      if (!doesLie(speaker)) {
        if (corruptedCount === 0) return "Next to me are no corrupted.";
        if (corruptedCount === 1) return "Next to me is 1 corrupted.";
        return `Next to me are ${corruptedCount} corrupted.`;
      }

      const neighbourCount = neighbours.length;
      const possibleCounts = Array.from(
        { length: neighbourCount + 1 },
        (_, i) => i,
      ).filter((n) => n !== corruptedCount);

      // Bias fake reports toward 0/1 while keeping other values possible.
      const weighted = [];
      if (possibleCounts.includes(0)) weighted.push(0, 0, 0);
      if (possibleCounts.includes(1)) weighted.push(1, 1, 1);
      weighted.push(...possibleCounts);

      const fakeCount = randomFrom(
        weighted.length ? weighted : [corruptedCount === 0 ? 1 : 0],
      );

      // Safety guard: a lying doctor must never report the true value.
      const guaranteedFakeCount =
        fakeCount === corruptedCount
          ? corruptedCount === 0
            ? 1
            : 0
          : fakeCount;

      if (guaranteedFakeCount === 0) return "Next to me are no corrupted.";
      if (guaranteedFakeCount === 1) return "Next to me is 1 corrupted.";
      return `Next to me are ${guaranteedFakeCount} corrupted.`;
    },
  },

  /**
   * WITNESS
   * Points at a random other character and describes them.
   * Werewolves are reported as guilty; villagers and corrupted villagers
   * are reported as innocent.
   */
  witness: {
    active: true,
    generate(speaker, allChars) {
      const possibleTargets = allChars.filter((c) => c.id !== speaker.id);
      const target = randomFrom(possibleTargets);

      if (!target) return "I can vouch for no one right now.";

      const targetLooksLikeWerewolf = isWerewolfLike(target);

      if (doesLie(speaker)) {
        return `${target.profession} is ${targetLooksLikeWerewolf ? "innocent" : "guilty"}.`;
      }

      return `${target.profession} is ${targetLooksLikeWerewolf ? "guilty" : "innocent"}.`;
    },
  },

  /**
   * RECLUSE
   * Always says they feel unwanted, and everyone else treats them like a werewolf.
   */
  recluse: {
    active: true,
    generate() {
      return "No one likes me.";
    },
  },

  /**
   * NEIGHBOUR
   * Looks at the characters directly adjacent on the grid
   * (left, right, above, below — no diagonals) and reports
   * whether any of them is a threat (werewolf or corrupted).
   *
   *   villager truthful:
   *     threat nearby  → "INFO: 1 WOLF NEARBY"
   *     no threat      → "INFO: NO WOLVES NEARBY"
   *
   *   werewolf / corrupted (lies - inverts the truth):
   *     threat nearby  → "INFO: NO WOLVES NEARBY"   ← lie
   *     no threat      → "INFO: 1 WOLF NEARBY"       ← lie
   */
  neighbour: {
    active: true,
    generate(speaker, allChars) {
      const neighbours = getGridNeighbours(speaker, allChars);

      const threatCount = neighbours.filter((c) => isWerewolfLike(c)).length;

      if (!doesLie(speaker)) {
        if (threatCount === 0) return "Next to me are no wolves.";
        if (threatCount === 1) return "Next to me is 1 wolf.";
        return `Next to me are ${threatCount} wolves.`;
      }

      // Liar: report a wrong count
      const neighbourCount = neighbours.length;
      const possibleCounts = Array.from(
        { length: neighbourCount + 1 },
        (_, i) => i,
      ).filter((n) => n !== threatCount);
      const fakeCount = randomFrom(
        possibleCounts.length ? possibleCounts : [threatCount === 0 ? 1 : 0],
      );

      if (fakeCount === 0) return "Next to me are no wolves.";
      if (fakeCount === 1) return "Next to me is 1 wolf.";
      return `Next to me are ${fakeCount} wolves.`;
    },
  },

  /**
   * WATCHMAN
   * Checks either the speaker's row or column and reports whether that line
   * contains a werewolf.
   */
  watchman: {
    active: true,
    generate(speaker, allChars) {
      const rowChars = allChars.filter(
        (c) => c.id !== speaker.id && c.position.row === speaker.position.row,
      );
      const columnChars = allChars.filter(
        (c) => c.id !== speaker.id && c.position.col === speaker.position.col,
      );

      const rowThreats = rowChars.filter((c) => isWerewolfLike(c)).length;
      const columnThreats = columnChars.filter((c) => isWerewolfLike(c)).length;

      const makeStatement = (lineName, threatCount) => {
        if (threatCount === 0) return `My ${lineName} has no werewolves.`;
        if (threatCount === 1) return `My ${lineName} has 1 werewolf.`;
        return `My ${lineName} has ${threatCount} werewolves.`;
      };

      if (!doesLie(speaker)) {
        const line = randomFrom([
          { name: "row", threats: rowThreats },
          { name: "column", threats: columnThreats },
        ]);
        return makeStatement(line.name, line.threats);
      }

      const safeLines = [
        { name: "row", threats: rowThreats },
        { name: "column", threats: columnThreats },
      ].filter((line) => line.threats === 0);

      if (safeLines.length) {
        return makeStatement(randomFrom(safeLines).name, 0);
      }

      const saferLine =
        rowThreats <= columnThreats
          ? { name: "row", threats: rowThreats }
          : { name: "column", threats: columnThreats };

      return makeStatement(saferLine.name, 0);
    },
  },

  /**
   * VOUCHER
   * Picks a random character and publicly vouches for their innocence.
   *
   *   truthful → picks a genuine villager (state === "villager") and
   *              correctly declares them innocent.
   *
   *   lying    → picks a werewolf or corrupted character and
   *              falsely declares them innocent, trying to protect them.
   *              Falls back to vouching for themselves if no other
   *              lying characters exist in the game.
   */
  // voucher removed; behavior merged into `witness` per rules

  // ── Empty stubs — add generate() to activate ─────────────

  alibi_provider: {
    // TODO: vouches for a specific other character
    active: false,
    generate(/* speaker, allChars */) {
      return "";
    },
  },

  accuser: {
    // TODO: always points a finger, never defends
    active: false,
    generate(/* speaker, allChars */) {
      return "";
    },
  },

  silent: {
    active: true,
    generate(/* speaker, allChars */) {
      return "...";
    },
  },
};

// Source of truth for role roll chances.
// When adding a new active role, update this table too so the chance split stays explicit.
export const ROLE_ROLL_CHANCES = {
  confessor: 4,
  president: 2,
  doctor: 4,
  witness: 10,
  neighbour: 10,
  watchman: 10,
  recluse: 2,
  silent: 1,
};

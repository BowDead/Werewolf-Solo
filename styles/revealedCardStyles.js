// ─────────────────────────────────────────────────────────────
// Revealed Card Styles — Werewolf / Corrupted / Villager
// ─────────────────────────────────────────────────────────────
// Applies consistent color theming to all card content when revealed
// (accused or endgame display)

const revealedCardStyles = {
  // ── WEREWOLF (Red) ────────────────────────────────────────
  werewolf: {
    cardBackground: "#4A1616",
    cardBorder: "#8B2020",
    quoteBoxBackground: "#5a1717",
    quoteBoxBorder: "#8B2020",
    textColor: "#FFFFFF",
    textWeight: "600",
    buttonBackground: "#EB5757",
    buttonBorder: "#8B2020",
    buttonTextColor: "#0B0B0B",
    buttonTextWeight: "700",
    stateColor: "#FF6B6B",
  },

  // ── CORRUPTED (Yellow) ────────────────────────────────────
  corrupted: {
    cardBackground: "#4a3b10",
    cardBorder: "#C9B14A",
    quoteBoxBackground: "#6b5d15",
    quoteBoxBorder: "#C9B14A",
    textColor: "#0b0b00",
    textWeight: "700",
    buttonBackground: "#F2C94C",
    buttonBorder: "#C9B14A",
    buttonTextColor: "#111006",
    buttonTextWeight: "700",
    stateColor: "#F0D46A",
  },

  // ── VILLAGER (Green) ──────────────────────────────────────
  villager: {
    cardBackground: "#183528",
    cardBorder: "#79B88E",
    quoteBoxBackground: "#1f4d38",
    quoteBoxBorder: "#79B88E",
    textColor: "#C8E6C9",
    textWeight: "600",
    buttonBackground: "#66BB6A",
    buttonBorder: "#4CAF50",
    buttonTextColor: "#0B0B0B",
    buttonTextWeight: "700",
    stateColor: "#81C784",
  },
};

export default revealedCardStyles;

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { DIFFICULTIES, DIFFICULTY_ORDER } from "./constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createGame } from "./gameLogic";
import { appTheme, sharedStyleObjects } from "./appStyles";
import { menuStyles } from "./menuStyles";
import revealedCardStyles from "./revealedCardStyles";

// ─────────────────────────────────────────────────────────────
//  DEVELOPER MODE
//  Set to true to show each character's role and state on their
//  card during gameplay. Flip back to false before shipping.
// ─────────────────────────────────────────────────────────────
const DEV_MODE = false;

// Labels shown in the debug badge
const DEV_STATE_LABEL = {
  villager: "Villager",
  villager_corrupted: "Corrupted",
  werewolf: "Werewolf",
};

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────
export default function GameMode({ onExit }) {
  const { width } = useWindowDimensions();
  const [phase, setPhase] = useState("menu");
  const [game, setGame] = useState(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasSave, setHasSave] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(true);

  const SAVE_KEY = "WEREWOLF_SAVE";

  useEffect(() => {
    loadProgress().then((data) => {
      if (data) {
        setLevelIndex(data.levelIndex);
        setScore(data.score);
        setHasSave(true);
      }
    });
  }, []);

  const saveProgress = async (data) => {
    try {
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
      setHasSave(true);
    } catch {}
  };

  const loadProgress = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const clearProgress = async () => {
    await AsyncStorage.removeItem(SAVE_KEY);
    setHasSave(false);
  };

  // All characters that count as hidden threats
  const threats = useMemo(() => {
    if (!game) return [];
    return game.characters.filter((c) => c.state === "werewolf");
  }, [game]);

  // Pad grid to minimum 9 slots with placeholders
  const visibleGridItems = useMemo(() => {
    if (!game) return [];
    const totalSlots = Math.max(9, game.characters.length);
    const placeholders = Array.from(
      { length: totalSlots - game.characters.length },
      (_, index) => ({ id: `placeholder-${index}`, placeholder: true }),
    );
    return [...game.characters, ...placeholders];
  }, [game]);

  // ── Actions ───────────────────────────────────────────────

  const startGameAtIndex = (index, newScore = score) => {
    const levelKey = DIFFICULTY_ORDER[index];
    const newGame = createGame(levelKey);

    setLevelIndex(index);
    setScore(newScore);
    setGame(newGame);
    setActiveSpeakerId(null);
    setPhase("playing");
    setShowResultOverlay(true);

    saveProgress({
      levelIndex: index,
      score: newScore,
    });
  };

  const goToResult = (nextGameState, resultType) => {
    let newLevelIndex = levelIndex;
    let newScore = score;

    if (resultType === "win") {
      newScore += 1;

      if (levelIndex < DIFFICULTY_ORDER.length - 1) {
        newLevelIndex += 1;
      }
    }

    setLevelIndex(newLevelIndex);
    setScore(newScore);
    setShowResultOverlay(true);

    saveProgress({
      levelIndex: newLevelIndex,
      score: newScore,
    });

    setGame({ ...nextGameState, result: resultType });
    setPhase("result");
  };

  const accuseCharacter = (characterId) => {
    if (!game || game.result) return;

    const selected = game.characters.find((c) => c.id === characterId);
    if (!selected || selected.accused) return;

    const updatedCharacters = game.characters.map((c) =>
      c.id === characterId ? { ...c, accused: true } : c,
    );

    const isThreat = selected.state === "werewolf";
    const isPresident = selected.role === "president";

    // President rule:
    // - villager president: no mistake
    // - werewolf president: no mistake (already true via isThreat)
    // - corrupted president: +2 mistakes
    let mistakeCost = isThreat ? 0 : 1;
    if (isPresident && selected.state === "villager") {
      mistakeCost = 0;
    }
    if (isPresident && selected.state === "villager_corrupted") {
      mistakeCost = 2;
    }

    const nextMistakes = game.mistakes + mistakeCost;
    const nextFoundThreats = isThreat
      ? game.foundThreats + 1
      : game.foundThreats;

    const nextGame = {
      ...game,
      characters: updatedCharacters,
      mistakes: nextMistakes,
      foundThreats: nextFoundThreats,
    };

    if (isThreat) {
      const label =
        selected.state === "villager_corrupted"
          ? "corrupted villager"
          : "werewolf";
      Alert.alert("Correct", `${selected.profession} is a ${label}.`);
    } else {
      Alert.alert("Wrong", `${selected.profession} is innocent.`);
    }

    if (nextFoundThreats >= game.totalThreats) {
      goToResult(nextGame, "win");
      return;
    }
    if (nextMistakes > game.config.maxMistakes) {
      goToResult(nextGame, "lose");
      return;
    }

    setGame(nextGame);
  };

  // ── Layout helpers ────────────────────────────────────────

  const getTileWidth = (columns) => (columns === 2 ? "48.2%" : "31.8%");
  const isEndgame = phase === "result";

  const getRevealedStyles = (state) => {
    if (state === "werewolf") return revealedCardStyles.werewolf;
    if (state === "villager_corrupted") return revealedCardStyles.corrupted;
    return revealedCardStyles.villager;
  };

  const bubbleWidth = Math.max(
    136,
    Math.min(220, Math.floor((width - 28) / 3) * 2),
  );

  const renderGameBoard = () => (
    <SafeAreaView style={menuStyles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Werewolf Solo</Text>
        {DEV_MODE && <Text style={styles.devModeHeader}>⚙ DEVELOPER MODE</Text>}
        <Text style={styles.headerStats}>
          Found: {game.foundThreats}/{game.totalThreats} | Mistakes:{" "}
          {game.mistakes}/{game.config.maxMistakes}
        </Text>
        <Text style={styles.headerHint}>
          Werewolves and corrupted always lie; villagers always tell the truth.
        </Text>
      </View>

      <ScrollView
        style={styles.listWrap}
        contentContainerStyle={styles.gridContent}
        removeClippedSubviews={false}
      >
        {visibleGridItems.map((character, tileIndex) => {
          if (character.placeholder) {
            return (
              <View
                key={character.id}
                style={[
                  styles.gridItem,
                  {
                    width: getTileWidth(game.config.gridCols),
                    maxWidth: width * 0.46,
                  },
                ]}
              >
                <View style={styles.placeholderCard} />
              </View>
            );
          }

          const isBubbleVisible = activeSpeakerId === character.id;

          const devStateStyle =
            character.state === "werewolf"
              ? styles.devBadgeWerewolf
              : character.state === "villager_corrupted"
                ? styles.devBadgeCorrupted
                : styles.devBadgeVillager;

          return (
            <View
              key={character.id}
              style={[
                styles.gridItem,
                {
                  width: getTileWidth(game.config.gridCols),
                  maxWidth: width * 0.46,
                },
              ]}
            >
              <Pressable
                style={[
                  styles.card,
                  (character.accused || isEndgame) && {
                    backgroundColor: getRevealedStyles(character.state)
                      .cardBackground,
                    borderColor: getRevealedStyles(character.state).cardBorder,
                    borderWidth: 3,
                  },
                  character.accused && {
                    borderColor: "#FFFFFF",
                  },
                  DEV_MODE && character.state === "werewolf"
                    ? styles.cardDevWerewolf
                    : null,
                  DEV_MODE && character.state === "villager_corrupted"
                    ? styles.cardDevCorrupted
                    : null,
                ]}
                onHoverIn={() => setActiveSpeakerId(character.id)}
                onHoverOut={() =>
                  setActiveSpeakerId((prev) =>
                    prev === character.id ? null : prev,
                  )
                }
                onLongPress={() => setActiveSpeakerId(character.id)}
                onPressOut={() =>
                  setActiveSpeakerId((prev) =>
                    prev === character.id ? null : prev,
                  )
                }
                delayLongPress={180}
              >
                {DEV_MODE && (
                  <View style={styles.devBadgeRow}>
                    <Text style={styles.devBadgeRole}>{character.role}</Text>
                    <Text style={[styles.devBadgeState, devStateStyle]}>
                      {DEV_STATE_LABEL[character.state] ?? character.state}
                    </Text>
                  </View>
                )}

                <Text style={styles.cardTitle}>{character.profession}</Text>

                {isEndgame && (
                  <View style={styles.endgameStateRow}>
                    <Text
                      style={[
                        styles.endgameStateLabel,
                        {
                          color: getRevealedStyles(character.state).stateColor,
                        },
                      ]}
                    >
                      {DEV_STATE_LABEL[character.state] ?? character.state}
                    </Text>
                  </View>
                )}

                <View
                  pointerEvents="none"
                  style={[
                    styles.quoteBox,
                    (character.accused || isEndgame) && {
                      backgroundColor: getRevealedStyles(character.state)
                        .quoteBoxBackground,
                      borderColor: getRevealedStyles(character.state)
                        .quoteBoxBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      (character.accused || isEndgame) && {
                        color: getRevealedStyles(character.state).textColor,
                        fontWeight: getRevealedStyles(character.state)
                          .textWeight,
                      },
                    ]}
                    numberOfLines={4}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {character.statement}
                  </Text>
                </View>

                {!isEndgame && (
                  <TouchableOpacity
                    style={[
                      styles.accuseButton,
                      character.accused && {
                        backgroundColor: getRevealedStyles(character.state)
                          .buttonBackground,
                        borderColor: getRevealedStyles(character.state)
                          .buttonBorder,
                        borderWidth: 3,
                      },
                      character.accused &&
                      !character.state === "werewolf" &&
                      !character.state === "villager_corrupted"
                        ? styles.accuseButtonDisabled
                        : null,
                    ]}
                    onPress={() => accuseCharacter(character.id)}
                    disabled={character.accused}
                  >
                    <Text
                      style={[
                        styles.accuseButtonText,
                        character.accused && {
                          color: getRevealedStyles(character.state)
                            .buttonTextColor,
                          fontWeight: getRevealedStyles(character.state)
                            .buttonTextWeight,
                        },
                      ]}
                    >
                      {character.accused
                        ? character.state === "werewolf"
                          ? "Werewolf"
                          : character.state === "villager_corrupted"
                            ? "Corrupted"
                            : "Villager"
                        : "Accuse"}
                    </Text>
                  </TouchableOpacity>
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footerBox}>
        <TouchableOpacity
          style={menuStyles.secondaryButton}
          onPress={() => setPhase("menu")}
        >
          <Text style={menuStyles.secondaryButtonText}>Back to menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderResultOverlay = () => {
    const isWin = game.result === "win";

    if (!showResultOverlay) {
      return (
        <View style={styles.revealCatchAll} pointerEvents="none">
          <Pressable
            style={styles.revealHintPressable}
            onPress={() => setShowResultOverlay(true)}
            pointerEvents="auto"
          >
            <View style={styles.revealHintChip}>
              <Text style={styles.revealHintText}>
                Click here to show summary
              </Text>
            </View>
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable
        style={styles.resultOverlayScrim}
        onPress={() => setShowResultOverlay(false)}
      >
        <View style={styles.resultOverlayPanel}>
          <Text style={styles.resultOverlayTitle}>
            {isWin ? "Victory" : "Defeat"}
          </Text>
          <Text style={styles.resultOverlayText}>
            {isWin
              ? "You found all hidden enemies."
              : "The mistake limit has been reached."}
          </Text>
          <Text style={styles.resultOverlayText}>Hidden enemies:</Text>
          {threats.map((t) => (
            <Text key={t.id} style={styles.resultOverlayThreat}>
              {"• "}
              {t.profession}
              {"  "}
              <Text style={styles.wolfStateLabel}>
                ({t.state === "villager_corrupted" ? "Corrupted" : "Werewolf"})
              </Text>
            </Text>
          ))}

          <TouchableOpacity
            style={menuStyles.menuButton}
            onPress={() => startGameAtIndex(levelIndex)}
          >
            <Text style={menuStyles.menuButtonTitle}>Play again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={menuStyles.secondaryButton}
            onPress={() => setPhase("menu")}
          >
            <Text style={menuStyles.secondaryButtonText}>Main menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hideOverlayButton}
            onPress={() => setShowResultOverlay(false)}
          >
            <Text style={styles.hideOverlayButtonText}>Hide summary</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  // ─────────────────────────────────────────────────────────
  //  DIFFICULTY SCREEN
  // ─────────────────────────────────────────────────────────
  if (phase === "menu") {
    return (
      <SafeAreaView style={menuStyles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={menuStyles.screenWrap}>
          <Text style={menuStyles.sectionTitle}>Werewolf Solo</Text>

          {hasSave && (
            <TouchableOpacity
              style={menuStyles.menuButton}
              onPress={() => startGameAtIndex(levelIndex)}
            >
              <Text style={menuStyles.menuButtonTitle}>Continue</Text>
              <Text style={menuStyles.menuButtonSub}>
                Level: {DIFFICULTY_ORDER[levelIndex]} • Score: {score}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={menuStyles.menuButton}
            onPress={() => {
              clearProgress();
              startGameAtIndex(0, 0);
            }}
          >
            <Text style={menuStyles.menuButtonTitle}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity style={menuStyles.secondaryButton} onPress={onExit}>
            <Text style={menuStyles.secondaryButtonText}>Back to menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!game) return null;

  // ─────────────────────────────────────────────────────────
  //  RESULT SCREEN
  // ─────────────────────────────────────────────────────────
  if (phase === "result") {
    return (
      <View style={styles.resultScreenWrap}>
        {renderGameBoard()}
        {renderResultOverlay()}
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────
  //  PLAYING SCREEN
  // ─────────────────────────────────────────────────────────
  return renderGameBoard();
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  menuIcon: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
    alignSelf: "center",
  },
  headerBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.divider,
  },
  headerTitle: {
    color: appTheme.colors.textMain,
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
  },
  headerStats: {
    color: appTheme.colors.textSub,
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  headerHint: {
    color: appTheme.colors.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  // ── Dev mode ───────────────────────────────────────────────
  devModeHeader: {
    color: "#FFD166",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
    marginTop: 4,
  },
  devBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  devBadgeRole: {
    color: "#9DA5E5",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  devBadgeState: {
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  devBadgeVillager: { color: "#6FCF97" },
  devBadgeCorrupted: { color: "#CE93D8" },
  devBadgeWerewolf: { color: "#EB5757" },
  // Subtle border tint so threats are visible without reading the text
  cardDevWerewolf: { borderColor: "#8B2020", borderWidth: 2 },
  cardDevCorrupted: { borderColor: "#7B3FA0", borderWidth: 2 },

  // ── Grid ──────────────────────────────────────────────────
  listWrap: { flex: 1 },
  gridContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  gridItem: {
    minHeight: 190,
    position: "relative",
    overflow: "visible",
    zIndex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: appTheme.colors.surfaceAlt,
    borderWidth: 2,
    borderColor: appTheme.colors.borderMuted,
    borderRadius: 16,
    padding: 12,
    justifyContent: "space-between",
  },
  cardAccused: { opacity: 0.72, borderColor: "#9FA5E6" },
  cardRevealedWerewolf: {
    backgroundColor: "#4A1616",
    borderColor: "#8B2020",
    borderWidth: 3,
  },
  cardRevealedCorrupted: {
    backgroundColor: "#4a3b10",
    borderColor: "#C9B14A",
    borderWidth: 3,
  },
  cardEndgameWerewolf: {
    backgroundColor: "#4A1616",
    borderColor: "#F29999",
    borderWidth: 3,
  },
  cardEndgameCorrupted: {
    backgroundColor: "#4a3b10",
    borderColor: "#F0D46A",
    borderWidth: 3,
  },
  cardEndgameVillager: {
    backgroundColor: "#183528",
    borderColor: "#79B88E",
    borderWidth: 3,
  },
  cardTitle: {
    color: appTheme.colors.textMain,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  endgameStateRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  endgameStateLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quoteBox: {
    marginTop: 8,
    marginBottom: 8,
    minHeight: 42,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: appTheme.colors.borderMuted,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleText: {
    color: appTheme.colors.textMain,
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
    width: "100%",
    includeFontPadding: false,
  },
  bubbleTextRevealed: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bubbleTextRevealedCorrupted: {
    color: "#0b0b00",
    fontWeight: "700",
  },
  accuseButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.action,
    alignItems: "center",
    justifyContent: "center",
  },
  accuseButtonDisabled: {
    backgroundColor: appTheme.colors.actionDisabled,
    borderColor: appTheme.colors.actionDisabledBorder,
  },
  accuseButtonText: {
    color: "#090909",
    fontSize: 16,
    fontWeight: "600",
  },
  revealedButton: {
    backgroundColor: "#EB5757",
    borderColor: "#8B2020",
    borderWidth: 3,
  },
  revealedButtonCorrupted: {
    backgroundColor: "#F2C94C",
    borderColor: "#C9B14A",
    borderWidth: 3,
  },
  revealedButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
  footerBox: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  wolfStateLabel: {
    color: appTheme.colors.textHint,
    fontSize: 14,
    fontStyle: "italic",
  },
  resultScreenWrap: {
    flex: 1,
  },
  resultOverlayScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  resultOverlayPanel: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "rgba(13, 15, 18, 0.96)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 10,
  },
  resultOverlayTitle: {
    color: appTheme.colors.textMain,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  resultOverlayText: {
    color: appTheme.colors.textSub,
    fontSize: 16,
    textAlign: "center",
  },
  resultOverlayThreat: {
    color: appTheme.colors.textSub,
    fontSize: 16,
    textAlign: "center",
  },
  hideOverlayButton: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hideOverlayButtonText: {
    color: appTheme.colors.textHint,
    fontSize: 14,
    fontWeight: "700",
  },
  revealCatchAll: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 28,
    pointerEvents: "none",
  },
  revealHintPressable: {
    pointerEvents: "auto",
  },
  revealHintChip: {
    backgroundColor: "rgba(13, 15, 18, 0.9)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  revealHintText: {
    color: appTheme.colors.textMain,
    fontSize: 14,
    fontWeight: "700",
  },

  placeholderCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.cardPlaceholderBorder,
    borderStyle: "dashed",
    backgroundColor: appTheme.colors.cardPlaceholderBackground,
    opacity: 0.45,
  },
});

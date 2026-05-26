import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { appTheme, sharedStyleObjects } from "./appStyles";

const API_URL = "http://localhost:3000";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function ScoreboardScreen({ onExit, currentUser }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/leaderboard?limit=20`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setEntries(data);
    } catch {
      setError("Could not load scoreboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const renderItem = ({ item, index }) => {
    const rank = index + 1;
    const isMe = currentUser && item.userid === currentUser.userid;

    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <Text style={styles.rank}>
          {MEDAL[rank] ?? `#${rank}`}
        </Text>
        <Text style={[styles.nickname, isMe && styles.nicknameHighlight]} numberOfLines={1}>
          {item.nickname}
        </Text>
        <Text style={styles.score}>{item.totalscore} pts</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.outer}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerSide} onPress={onExit} activeOpacity={0.85}>
            <Text style={styles.backArrow}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ranking</Text>
          <TouchableOpacity style={styles.headerSide} onPress={fetchLeaderboard} activeOpacity={0.85}>
            <Text style={styles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={fetchLeaderboard} activeOpacity={0.9}>
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>No scores yet.</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => String(item.userid)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: sharedStyleObjects.safeArea,
  outer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    borderRadius: appTheme.radius.xxl,
    borderWidth: appTheme.borderWidth.xl,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.primaryAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  headerSide: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: appTheme.colors.textButtonDark,
    fontSize: 22,
    fontWeight: "800",
  },
  refreshIcon: {
    color: appTheme.colors.textButtonDark,
    fontSize: 26,
    fontWeight: "800",
  },
  headerTitle: {
    color: appTheme.colors.textButtonDark,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  list: {
    borderRadius: appTheme.radius.xl,
    borderWidth: appTheme.borderWidth.xl,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.surface,
    overflow: "hidden",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  rowHighlight: {
    backgroundColor: appTheme.colors.primaryAlt,
  },
  rank: {
    width: 42,
    color: appTheme.colors.textMain,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  nickname: {
    flex: 1,
    color: appTheme.colors.textSub,
    fontSize: 18,
    fontWeight: "600",
  },
  nicknameHighlight: {
    color: appTheme.colors.textMain,
  },
  score: {
    color: appTheme.colors.textHint,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  separator: {
    height: 2,
    backgroundColor: appTheme.colors.divider,
    marginHorizontal: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: appTheme.colors.textMuted,
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    ...sharedStyleObjects.primaryButton,
    minHeight: 56,
    borderRadius: appTheme.radius.xxl,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: appTheme.colors.textButtonDark,
    fontSize: 20,
    fontWeight: "500",
  },
});

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function confirm(title, message, onConfirm, confirmLabel = "Confirm") {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
import { appTheme, sharedStyleObjects } from "../styles/appStyles";

const API_URL = "http://localhost:5000";

const SCORE_ACHIEVEMENTS = [
  { statname: "achievement_500",  label: "Rookie - Score 500 points" },
  { statname: "achievement_1000", label: "Veteran - Score 1000 points" },
  { statname: "achievement_3000", label: "Legend - Score 3000 points" },
];

const WW_FOUND_ACHIEVEMENTS = [
  { statname: "achievement_ww_1",   label: "First Blood - Find your first werewolf" },
  { statname: "achievement_ww_10",  label: "Hunter - Find 10 werewolves" },
  { statname: "achievement_ww_100", label: "Witch Hunter - Find 100 werewolves" },
];

const MISC_ACHIEVEMENTS = [
  { statname: "achievement_mayor",       label: "Ups - Accuse a mayor" },
  { statname: "achievement_recluse_ww",  label: "I don't like you too - Accuse a recluse werewolf" },
];

// ─── HEADER ───────────────────────────────────────────────────

function Header({ title, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerSide}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <Text style={styles.backArrow}>◀</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSide} />
    </View>
  );
}

// ─── ACCOUNT VIEW ─────────────────────────────────────────────

function AccountView({ onExit, user, onLogout, onDelete, onLogin, onRegister }) {
  const [earnedStatnames, setEarnedStatnames] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/userstats/${user.userid}`)
      .then((r) => r.json())
      .then((data) => {
        const earned = new Set(
          data
            .filter((s) => Number(s.value) === 1 && s.statname?.startsWith("achievement_"))
            .map((s) => s.statname)
        );
        setEarnedStatnames(earned);
      })
      .catch(() => setEarnedStatnames(new Set()));
  }, [user]);

  const confirmLogout = () => {
    confirm("Log out", "Are you sure you want to log out?", onLogout, "Log out");
  };

  const confirmDelete = () => {
    confirm(
      "Delete account",
      "This will permanently delete your account. This cannot be undone.",
      async () => {
        try {
          const res = await fetch(`${API_URL}/users/${user.userid}`, {
            method: "DELETE",
          });
          if (res.ok || res.status === 204) {
            onDelete();
          } else {
            Alert.alert("Error", "Could not delete account.");
          }
        } catch {
          Alert.alert("Error", "Could not connect to server.");
        }
      },
      "Delete",
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.outer}
        contentContainerStyle={styles.outerContent}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="Account" onBack={onExit} />

        {user ? (
          <>
            <View style={[styles.nicknameBox, { marginTop: 18 }]}>
              <Text style={styles.nicknameText}>#{user.nickname}</Text>
            </View>

            <View style={styles.achievementsSection}>
              <Text style={styles.achievementsSectionTitle}>Achievements</Text>
              {[...SCORE_ACHIEVEMENTS, ...WW_FOUND_ACHIEVEMENTS, ...MISC_ACHIEVEMENTS].map((ach) => {
                const earned = earnedStatnames?.has(ach.statname) ?? false;
                return (
                  <View
                    key={ach.statname}
                    style={[
                      styles.achievementRow,
                      earned ? styles.achievementRowEarned : styles.achievementRowLocked,
                    ]}
                  >
                    <Text style={[styles.achievementIcon, earned ? styles.achievementIconEarned : styles.achievementIconLocked]}>
                      {earned ? "★" : "☆"}
                    </Text>
                    <Text style={[styles.achievementLabel, earned ? styles.achievementLabelEarned : styles.achievementLabelLocked]}>
                      {ach.label}
                    </Text>
                    {earned && <Text style={styles.achievementDone}>Unlocked</Text>}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={confirmLogout}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton, { marginTop: 14 }]}
              onPress={confirmDelete}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Delete account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.buttonsBlock}>
            <TouchableOpacity
              style={styles.button}
              onPress={onRegister}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { marginTop: 14 }]}
              onPress={onLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── LOGIN VIEW ───────────────────────────────────────────────

function LoginView({ onBack, onSuccess }) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nickname.trim() || !password.trim()) {
      Alert.alert("Error", "Fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else {
        Alert.alert("Error", data.error || "Login failed.");
      }
    } catch {
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.outer}>
        <Header title="Log in" onBack={onBack} />

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            placeholderTextColor={appTheme.colors.textHint}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={appTheme.colors.textHint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { marginTop: 4 }]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── REGISTER VIEW ────────────────────────────────────────────

function RegisterView({ onBack, onSuccess }) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nickname.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setLoading(true);
    console.log("[Register] sending request", { nickname: nickname.trim() });
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), password }),
      });
      console.log("[Register] status", res.status);
      const data = await res.json();
      console.log("[Register] response body", data);
      if (res.ok) {
        console.log("[Register] success", data);
        onSuccess(data);
      } else {
        console.warn("[Register] server error", data);
        Alert.alert("Error", data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("[Register] fetch failed", err);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.outer}>
        <Header title="Sign up" onBack={onBack} />

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            placeholderTextColor={appTheme.colors.textHint}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={appTheme.colors.textHint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={[
              styles.input,
              confirmPassword.length > 0 && password !== confirmPassword && styles.inputError,
            ]}
            placeholder="Confirm password"
            placeholderTextColor={appTheme.colors.textHint}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { marginTop: 4 }]}
            onPress={handleRegister}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Sign up</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────

export default function AccountScreen({ onExit, user, setUser }) {
  const [view, setView] = useState("account");

  const handleLogout = () => {
    setUser(null);
    setView("account");
  };

  const handleDelete = () => {
    setUser(null);
    setView("account");
  };

  if (view === "login") {
    return (
      <LoginView
        onBack={() => setView("account")}
        onSuccess={(userData) => {
          setUser(userData);
          setView("account");
        }}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterView
        onBack={() => setView("account")}
        onSuccess={(userData) => {
          setUser(userData);
          setView("account");
        }}
      />
    );
  }

  return (
    <AccountView
      onExit={onExit}
      user={user}
      onLogout={handleLogout}
      onDelete={handleDelete}
      onLogin={() => setView("login")}
      onRegister={() => setView("register")}
    />
  );
}

// ─── STYLES ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: sharedStyleObjects.safeArea,
  outer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  outerContent: {
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
  headerTitle: {
    color: appTheme.colors.textButtonDark,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  buttonsBlock: {
    marginTop: 18,
    width: "100%",
  },
  achievementsSection: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
    gap: 10,
  },
  achievementsSectionTitle: {
    color: appTheme.colors.textSub,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: appTheme.radius.lg,
    borderWidth: 2,
    gap: 12,
  },
  achievementRowEarned: {
    backgroundColor: "rgba(74, 59, 16, 0.55)",
    borderColor: "#C9B14A",
  },
  achievementRowLocked: {
    backgroundColor: appTheme.colors.panel,
    borderColor: appTheme.colors.borderMuted,
    opacity: 0.45,
  },
  achievementIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  achievementIconEarned: {
    color: "#F2C94C",
  },
  achievementIconLocked: {
    color: appTheme.colors.textHint,
  },
  achievementLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
  },
  achievementLabelEarned: {
    color: "#F2C94C",
  },
  achievementLabelLocked: {
    color: appTheme.colors.textHint,
  },
  achievementDone: {
    color: "#C9B14A",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    marginTop: 18,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.xl,
    borderWidth: appTheme.borderWidth.xl,
    borderColor: appTheme.colors.borderStrong,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  input: {
    backgroundColor: appTheme.colors.panel,
    borderRadius: appTheme.radius.md,
    borderWidth: appTheme.borderWidth.sm,
    borderColor: appTheme.colors.borderStrong,
    color: appTheme.colors.textMain,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: "#C0392B",
  },
  button: {
    ...sharedStyleObjects.primaryButton,
    minHeight: 64,
    borderRadius: appTheme.radius.xxl,
  },
  buttonText: {
    color: appTheme.colors.textButtonDark,
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  dangerButton: {
    backgroundColor: appTheme.colors.actionDisabled,
  },
  nicknameBox: {
    ...sharedStyleObjects.secondaryButton,
    minHeight: 64,
    borderRadius: appTheme.radius.xxl,
  },
  nicknameText: {
    color: appTheme.colors.textMain,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
});

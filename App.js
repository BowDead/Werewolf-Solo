import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AccountScreen from "./screens/AccountScreen";
import GameMode from "./screens/GameMode";
import OptionsScreen from "./screens/OptionsScreen";
import ScoreboardScreen from "./screens/ScoreboardScreen";
import { mainMenuStyles, menuStyles } from "./styles/menuStyles";
import { loadAppSettings, saveAppSettings } from "./game/gameProgress";

const USER_SESSION_KEY = "WEREWOLF_USER";

// ---------------------------------------------------------------------------
// 🎵 BACKGROUND MUSIC
// Set this to a require() of your audio file to enable background music
// across all screens. Leave as null to disable entirely — no errors either way.
//
// Example:
//   const BG_MUSIC = require("./assets/music/theme.mp3");
// ---------------------------------------------------------------------------
const BG_MUSIC = null;

// ---------------------------------------------------------------------------
// Optional expo-av — silent no-op if not installed
// ---------------------------------------------------------------------------
let Audio = null;
try {
  Audio = require("expo-av").Audio;
} catch (_) {}

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [user, setUser] = useState(null);
  const [volume, setVolume] = useState(60);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem(USER_SESSION_KEY);
        }
      } catch {}
    })();
  }, [user]);
  const [musicOn, setMusicOn] = useState(true);
  const [showAccuseAlerts, setShowAccuseAlerts] = useState(true);
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const soundRef = useRef(null);

  const { height } = useWindowDimensions();

  const hasBgMusic = Audio !== null && BG_MUSIC !== null;

  // ── Load music once on mount, keep it alive across all screens ────────────
  useEffect(() => {
    if (!hasBgMusic) return;
    let cancelled = false;

    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(BG_MUSIC, {
          shouldPlay: musicOn,
          isLooping: true,
          volume: volume / 100,
        });
        if (!cancelled) soundRef.current = sound;
      } catch (e) {
        console.warn("App: failed to load bg music", e);
      }
    })();

    return () => {
      cancelled = true;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync play / pause when toggle changes
  useEffect(() => {
    if (!soundRef.current) return;
    musicOn ? soundRef.current.playAsync() : soundRef.current.pauseAsync();
  }, [musicOn]);

  // Sync volume
  useEffect(() => {
    soundRef.current?.setVolumeAsync(volume / 100);
  }, [volume]);

  // ── Load app settings on mount ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const settings = await loadAppSettings();
      if (settings) {
        if (settings.showAccuseAlerts !== undefined) {
          setShowAccuseAlerts(settings.showAccuseAlerts);
        }
        if (settings.devModeEnabled !== undefined) {
          setDevModeEnabled(settings.devModeEnabled);
        }
      }
    })();
  }, []);

  // ── Save app settings when they change ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      await saveAppSettings({
        showAccuseAlerts,
        devModeEnabled,
      });
    })();
  }, [showAccuseAlerts, devModeEnabled]);

  // ── Responsive sizing ─────────────────────────────────────────────────────
  const isSmall = height < 680;
  const iconSize = Math.max(100, Math.min(200, height * 0.25));
  const buttonGap = Math.max(6, Math.min(14, height * 0.012));

  const menuItems = useMemo(
    () => [
      { label: "Play", onPress: () => setScreen("game") },
      { label: "Account", onPress: () => setScreen("account") },
      { label: "Ranking", onPress: () => setScreen("scoreboard") },
      { label: "Options", onPress: () => setScreen("options") },
      {
        label: "Quit",
        onPress: () => {
          if (Platform.OS === "android") {
            Alert.alert("Quit", "Are you sure you want to close the app?", [
              { text: "Cancel", style: "cancel" },
              { text: "Close", onPress: () => BackHandler.exitApp() },
            ]);
            return;
          }
          Alert.alert(
            "Quit",
            "On iOS the app cannot be closed programmatically.",
          );
        },
      },
    ],
    [],
  );

  // ── Screen routing ────────────────────────────────────────────────────────
  if (screen === "game") {
    return (
      <GameMode
        onExit={() => setScreen("menu")}
        showAccuseAlerts={showAccuseAlerts}
        devModeEnabled={devModeEnabled}
        currentUser={user}
      />
    );
  }

  if (screen === "scoreboard") {
    return (
      <ScoreboardScreen
        onExit={() => setScreen("menu")}
        currentUser={user}
      />
    );
  }

  if (screen === "account") {
    return (
      <AccountScreen
        onExit={() => setScreen("menu")}
        user={user}
        setUser={setUser}
      />
    );
  }

  if (screen === "options") {
    return (
      <OptionsScreen
        onExit={() => setScreen("menu")}
        volume={volume}
        setVolume={setVolume}
        musicOn={musicOn}
        setMusicOn={setMusicOn}
        showAccuseAlerts={showAccuseAlerts}
        setShowAccuseAlerts={setShowAccuseAlerts}
        devModeEnabled={devModeEnabled}
        setDevModeEnabled={setDevModeEnabled}
        hasBgMusic={hasBgMusic}
      />
    );
  }

  // ── Main menu ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={menuStyles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={menuStyles.screenWrap}>
        <View
          style={[
            mainMenuStyles.heroBlock,
            isSmall && mainMenuStyles.heroBlockSmall,
          ]}
        >
          <Image
            source={require("./assets/icon.png")}
            style={[mainMenuStyles.icon, { width: iconSize, height: iconSize }]}
          />
        </View>

        <View style={mainMenuStyles.buttonsBlock}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                menuStyles.menuButton,
                index < menuItems.length - 1 && { marginBottom: buttonGap },
              ]}
              onPress={item.onPress}
              activeOpacity={0.9}
            >
              <Text
                style={menuStyles.menuButtonTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Lightweight error boundary to surface runtime errors during development
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // still log to console for Metro
    console.error("Unhandled error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
          <Text style={{ color: "#900", fontWeight: "700", fontSize: 18 }}>
            An error occurred
          </Text>
          <Text style={{ marginTop: 12 }}>{String(this.state.error)}</Text>
          <Text style={{ marginTop: 8, color: "#666" }}>
            Check Metro console for full stack trace.
          </Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

// Wrap the default export with the ErrorBoundary so it catches render errors
const AppWithBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export { AppWithBoundary as App };

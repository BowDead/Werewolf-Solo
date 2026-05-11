/**
 * OptionsScreen.js
 *
 * Receives all sound state from App.js — owns nothing audio-related itself.
 * Brightness is handled locally (expo-brightness optional, silent no-op if absent).
 *
 * Props:
 *   onExit           () => void        back button handler
 *   volume           number            0-100  (from App.js)
 *   setVolume        (n) => void
 *   musicOn          boolean           (from App.js)
 *   setMusicOn       (b) => void
 *   showAccuseAlerts boolean           (from App.js)
 *   setShowAccuseAlerts (b) => void
 *   devModeEnabled   boolean           (from App.js)
 *   setDevModeEnabled (b) => void
 *   hasBgMusic       boolean           true only when BG_MUSIC is set in App.js
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  PanResponder,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { appTheme, sharedStyleObjects } from "./appStyles";

// ---------------------------------------------------------------------------
// SliderRow
// Uses PanResponder + measure() so pageX is always accurate regardless of
// nesting. locationX from TouchableOpacity is unreliable inside ScrollViews
// or deeply nested Views and causes NaN.
// ---------------------------------------------------------------------------
function SliderRow({ value, onChange }) {
  const trackWidthRef = useRef(1);

  // Keep width in sync on layout changes (rotation, first render, etc.)
  const onLayout = useCallback((evt) => {
    const width = evt?.nativeEvent?.layout?.width ?? 0;
    if (width > 0) trackWidthRef.current = width;
  }, []);

  const toValue = useCallback((locationX) => {
    const ratio = locationX / trackWidthRef.current;
    return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) =>
          onChange(toValue(evt.nativeEvent.locationX)),
        onPanResponderMove: (evt) =>
          onChange(toValue(evt.nativeEvent.locationX)),
      }),
    [onChange, toValue],
  );

  return (
    <View
      onLayout={onLayout}
      style={sliderStyles.track}
      {...panResponder.panHandlers}
    >
      <View style={[sliderStyles.fill, { width: `${value}%` }]} />
      <View style={[sliderStyles.thumb, { left: `${value}%` }]} />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: {
    height: 18,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: appTheme.colors.borderStrong,
    overflow: "visible",
    width: "100%",
    marginBottom: 20,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: appTheme.colors.primary,
    borderRadius: 9,
  },
  thumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#C5C8FF",
    borderWidth: 4,
    borderColor: appTheme.colors.borderStrong,
    top: -8,
    marginLeft: -14,
  },
});

// ---------------------------------------------------------------------------
// ToggleRow
// ---------------------------------------------------------------------------
function ToggleRow({ label, enabled, onToggle }) {
  return (
    <View style={toggleStyles.wrapper}>
      <Text style={toggleStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[toggleStyles.track, enabled && toggleStyles.trackOn]}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <View style={[toggleStyles.thumb, enabled && toggleStyles.thumbOn]} />
      </TouchableOpacity>
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  label: {
    color: appTheme.colors.textMain,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  track: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 3,
    borderColor: appTheme.colors.borderStrong,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  trackOn: { backgroundColor: appTheme.colors.primary },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#9FA3D4",
    borderWidth: 2,
    borderColor: appTheme.colors.borderStrong,
    alignSelf: "flex-start",
  },
  thumbOn: { alignSelf: "flex-end", backgroundColor: "#C5C8FF" },
});

// ---------------------------------------------------------------------------
// OptionsScreen
// ---------------------------------------------------------------------------
export default function OptionsScreen({
  onExit,
  volume = 60,
  setVolume,
  musicOn = true,
  setMusicOn,
  showAccuseAlerts = true,
  setShowAccuseAlerts,
  devModeEnabled = false,
  setDevModeEnabled,
  hasBgMusic = false,
}) {
  const { width, height } = useWindowDimensions();
  const buttonFontSize = Math.max(16, Math.min(22, width * 0.052));
  const sectionGap = Math.max(8, Math.min(20, height * 0.018));

  // ── Brightness (local — expo-brightness optional) ─────────────────────────
  const [brightness, setBrightnessValue] = useState(80);

  const setBrightness = useCallback((val) => {
    setBrightnessValue(val);
    try {
      const Brightness = require("expo-brightness");
      (async () => {
        try {
          if (Platform.OS === "android") {
            const { status } = await Brightness.requestPermissionsAsync();
            if (status !== "granted") return;
          }
          await Brightness.setSystemBrightnessAsync(val / 100);
        } catch (_) {}
      })();
    } catch (_) {}
  }, []);

  const handleSetVolume = useCallback((val) => setVolume?.(val), [setVolume]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.outer, { paddingHorizontal: 24 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onExit}
            activeOpacity={0.85}
          >
            <Text style={styles.backArrow}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: buttonFontSize + 4 }]}>
            Options
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* Card */}
        <View style={[styles.card, { marginTop: sectionGap }]}>
          {/* Brightness */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brightness</Text>
          </View>
          <View style={styles.sliderMeta}>
            <Text style={styles.sliderEmoji}>☀️</Text>
            <Text style={styles.sliderValue}>{brightness}%</Text>
          </View>
          <SliderRow value={brightness} onChange={setBrightness} />

          <View style={styles.divider} />

          {/* Volume */}
          <View style={[styles.sectionHeader, { marginTop: sectionGap }]}>
            <Text style={styles.sectionTitle}>Volume</Text>
          </View>
          <View style={styles.sliderMeta}>
            <Text style={styles.sliderEmoji}>🔊</Text>
            <Text style={styles.sliderValue}>{volume}%</Text>
          </View>
          <SliderRow value={volume} onChange={handleSetVolume} />

          {/* Music toggle — only when BG_MUSIC is set in App.js */}
          {hasBgMusic && (
            <>
              <View style={styles.divider} />
              <View style={{ marginTop: sectionGap }}>
                <ToggleRow
                  label="Background Music"
                  enabled={musicOn}
                  onToggle={() => setMusicOn?.((v) => !v)}
                />
              </View>
            </>
          )}

          <View style={styles.divider} />
          <View style={{ marginTop: sectionGap }}>
            <ToggleRow
              label="Accusation Popups"
              enabled={showAccuseAlerts}
              onToggle={() => setShowAccuseAlerts?.((v) => !v)}
            />
          </View>

          <View style={styles.divider} />
          <View style={{ marginTop: sectionGap }}>
            <ToggleRow
              label="Developer Mode"
              enabled={devModeEnabled}
              onToggle={() => setDevModeEnabled?.((v) => !v)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: sharedStyleObjects.safeArea,
  outer: { flex: 1, paddingTop: 12, paddingBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 64,
    borderRadius: 22,
    borderWidth: 6,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.primaryAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButton: { width: 44, alignItems: "center", justifyContent: "center" },
  backArrow: {
    color: appTheme.colors.textButtonDark,
    fontSize: 22,
    fontWeight: "800",
  },
  headerTitle: {
    color: appTheme.colors.textButtonDark,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  card: {
    ...sharedStyleObjects.primaryButton,
    width: "100%",
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: appTheme.colors.borderStrong,
    backgroundColor: appTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: appTheme.colors.textButtonDark,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sliderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sliderEmoji: { fontSize: 16 },
  sliderValue: {
    color: appTheme.colors.textHint,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 4,
    backgroundColor: appTheme.colors.borderStrong,
    borderRadius: 2,
    marginVertical: 8,
  },
});

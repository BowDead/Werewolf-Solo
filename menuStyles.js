import { StyleSheet } from "react-native";
import { appTheme, sharedStyleObjects } from "./appStyles";

export const menuStyles = StyleSheet.create({
  safeArea: sharedStyleObjects.safeArea,
  screenWrap: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: "center",
    gap: 14,
  },
  sectionTitle: {
    color: appTheme.colors.textMain,
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  menuButton: {
    ...sharedStyleObjects.primaryButton,
    minHeight: 84,
    borderRadius: appTheme.radius.xxl,
  },
  menuButtonTitle: {
    color: appTheme.colors.textButtonDark,
    fontSize: 28,
    fontWeight: "500",
    textAlign: "center",
  },
  menuButtonSub: {
    color: appTheme.colors.textButtonDarkSoft,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 3,
    textAlign: "center",
  },
  secondaryButton: {
    ...sharedStyleObjects.secondaryButton,
    minHeight: 64,
  },
  secondaryButtonText: sharedStyleObjects.secondaryButtonText,
});

export const mainMenuStyles = StyleSheet.create({
  heroBlock: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 8,
  },
  heroBlockSmall: {
    paddingBottom: 2,
  },
  icon: {
    resizeMode: "contain",
  },
  buttonsBlock: {
    width: "100%",
    justifyContent: "center",
  },
});

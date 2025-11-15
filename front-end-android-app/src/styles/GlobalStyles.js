// src/styles/GlobalStyles.js
import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#2E7D32", // green (Driver Motion theme)
  accent: "#4CAF50",
  background: "#FFFFFF",
  textDark: "#1B1B1B",
  textLight: "#777",
  error: "#E53935",
};

export const FONTS = {
  title: 28,
  subtitle: 20,
  text: 16,
  small: 13,
};

export const GLOBAL_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FONTS.subtitle,
    fontWeight: "600",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: COLORS.textLight,
    paddingVertical: 10,
    fontSize: FONTS.text,
    marginBottom: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: FONTS.text,
    fontWeight: "700",
  },
  linkText: {
    color: COLORS.primary,
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
    fontSize: FONTS.small,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.small,
    marginBottom: 6,
    marginLeft: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    color: "#555",
  },
  score: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007BFF",
  },
});
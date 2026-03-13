import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { iconFor } from "../services/weatherAPI";

const ForecastCard = ({ label, tempMin, tempMax, condition, theme }) => {
  const icon = iconFor(condition);
  return (
    <BlurView intensity={40} tint="dark" style={styles.card}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
      <MaterialCommunityIcons name={icon} size={28} color={theme.accent} />
      <Text style={[styles.temp, { color: theme.textPrimary }]}>
        {Math.round(tempMax)}° / {Math.round(tempMin)}°
      </Text>
      <Text style={[styles.condition, { color: theme.textSecondary }]} numberOfLines={1}>
        {condition}
      </Text>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    padding: 12,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center"
  },
  label: { fontSize: 14, fontWeight: "600" },
  temp: { fontSize: 16, fontWeight: "700", marginVertical: 6 },
  condition: { fontSize: 12, textTransform: "capitalize" }
});

export default ForecastCard;

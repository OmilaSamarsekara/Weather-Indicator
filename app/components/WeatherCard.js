import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatUv, iconFor } from "../services/weatherAPI";

const Stat = ({ label, value, unit }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>
      {value}
      {unit}
    </Text>
  </View>
);

const WeatherCard = ({ city, current, theme }) => {
  if (!current) return null;
  const condition = current.weather?.[0]?.main || "Clear";
  const description = current.weather?.[0]?.description || "";
  const icon = iconFor(condition);
  const uv = formatUv(current.uvi || current.uvi === 0 ? current.uvi : current.uvi);
  return (
    <BlurView intensity={60} tint="dark" style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.city, { color: theme.textPrimary }]} numberOfLines={1}>
            {city || "Current location"}
          </Text>
          <Text style={[styles.condition, { color: theme.textSecondary }]}>
            {condition} • {description}
          </Text>
        </View>
        <MaterialCommunityIcons name={icon} size={40} color={theme.accent} />
      </View>

      <View style={styles.tempRow}>
        <Text style={[styles.temp, { color: theme.textPrimary }]}>
          {Math.round(current.main?.temp)}°
        </Text>
        <View style={styles.feels}>
          <Text style={[styles.feelsLabel, { color: theme.textSecondary }]}>Feels like</Text>
          <Text style={[styles.feelsValue, { color: theme.textPrimary }]}>
            {Math.round(current.main?.feels_like)}°
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Humidity" value={current.main?.humidity} unit="%" />
        <Stat label="Wind" value={current.wind?.speed} unit=" m/s" />
        <Stat label="Pressure" value={current.main?.pressure} unit=" hPa" />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>UV Index</Text>
          <Text style={[styles.statValue, { color: uv.color }]}>{uv.level}</Text>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  city: { fontSize: 20, fontWeight: "600" },
  condition: { fontSize: 14, textTransform: "capitalize" },
  tempRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 16 },
  temp: { fontSize: 72, fontWeight: "700", letterSpacing: -2 },
  feels: { marginLeft: 16 },
  feelsLabel: { fontSize: 12, opacity: 0.8 },
  feelsValue: { fontSize: 22, fontWeight: "600" },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "flex-start", minWidth: 72 },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  statValue: { fontSize: 16, fontWeight: "600", color: "#fff" }
});

export default WeatherCard;

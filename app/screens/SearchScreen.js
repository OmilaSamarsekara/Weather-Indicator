import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import { fetchCurrentByCity } from "../services/weatherAPI";
import { AppContext } from "../App";

const SearchScreen = ({ navigation }) => {
  const { theme, favorites, setFavorites, setSelectedCity } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchCurrentByCity(query.trim());
      setResult(data);
    } catch (e) {
      setError(e.message || "City not found");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const saveCity = () => {
    if (!result) return;
    const exists = favorites.find((c) => c.name === result.name);
    if (exists) return;
    setFavorites([...favorites, { name: result.name, country: result.country }]);
  };

  const selectCity = (city) => {
    setSelectedCity(city);
    navigation.navigate("Home");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={onSearch}
        placeholder="Enter city name"
        theme={theme}
      />
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      {error ? <Text style={[styles.error, { color: theme.textSecondary }]}>{error}</Text> : null}
      {result ? (
        <View style={[styles.resultCard, { borderColor: theme.border }]}>
          <View>
            <Text style={[styles.city, { color: theme.textPrimary }]}>{result.name}</Text>
            <Text style={{ color: theme.textSecondary }}>{result.country}</Text>
            <Text style={[styles.temp, { color: theme.textPrimary }]}>
              {Math.round(result.current.main?.temp)}°
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={saveCity}>
              <MaterialCommunityIcons name="heart-plus" size={22} color={theme.accent} />
              <Text style={[styles.actionText, { color: theme.textPrimary }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => selectCity(result)}>
              <MaterialCommunityIcons name="check-circle" size={22} color={theme.accent} />
              <Text style={[styles.actionText, { color: theme.textPrimary }]}>Use</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Saved cities</Text>
      {favorites.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>No saved cities yet</Text>
      ) : (
        favorites.map((city) => (
          <TouchableOpacity
            key={city.name}
            style={[styles.saved, { borderColor: theme.border }]}
            onPress={() => selectCity(city)}
          >
            <Text style={[styles.savedText, { color: theme.textPrimary }]}>
              {city.name}
              {city.country ? `, ${city.country}` : ""}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  error: { marginTop: 8 },
  resultCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  city: { fontSize: 20, fontWeight: "700" },
  temp: { fontSize: 32, fontWeight: "700", marginTop: 4 },
  actions: { alignItems: "flex-end" },
  action: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  actionText: { marginLeft: 6, fontWeight: "600" },
  sectionTitle: { marginTop: 20, marginBottom: 8, fontSize: 18, fontWeight: "700" },
  saved: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  savedText: { fontSize: 16, fontWeight: "600" }
});

export default SearchScreen;

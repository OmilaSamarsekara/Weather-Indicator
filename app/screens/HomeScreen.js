import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WeatherCard from "../components/WeatherCard";
import ForecastCard from "../components/ForecastCard";
import {
  fetchBundleByCity,
  fetchBundleByCoords,
  isNight as isNightFn
} from "../services/weatherAPI";
import { AppContext } from "../App";
import { weatherGradients } from "../styles/theme";

const formatDay = (dt) =>
  new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(dt * 1000));

const formatHour = (dt) =>
  new Intl.DateTimeFormat("en", { hour: "numeric" }).format(new Date(dt * 1000));

const HomeScreen = ({ navigation }) => {
  const {
    theme,
    isDark,
    toggleTheme,
    selectedCity,
    setSelectedCity,
    favorites,
    setFavorites
  } = useContext(AppContext);

  const [bundle, setBundle] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingGps, setUsingGps] = useState(!selectedCity);
  const shimmer = useRef(new Animated.Value(0)).current;

  const gradient = useMemo(() => {
    const condition =
      bundle?.onecall?.current?.weather?.[0]?.main ||
      bundle?.current?.weather?.[0]?.main ||
      "Clear";
    const night = bundle ? isNightFn(bundle.current) : false;
    return weatherGradients(condition, night);
  }, [bundle]);

  const mergedCurrent = useMemo(() => {
    if (!bundle) return null;
    if (bundle.onecall?.current) {
      const c = bundle.onecall.current;
      // merge temperature fields from /weather main for consistency
      return {
        ...bundle.current,
        main: {
          ...bundle.current?.main,
          temp: c.temp ?? bundle.current?.main?.temp,
          feels_like: c.feels_like ?? bundle.current?.main?.feels_like,
          pressure: bundle.current?.main?.pressure,
          humidity: c.humidity ?? bundle.current?.main?.humidity
        },
        wind: { ...bundle.current?.wind, speed: c.wind_speed ?? bundle.current?.wind?.speed },
        uvi: c.uvi
      };
    }
    return bundle.current;
  }, [bundle]);

  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") throw new Error("Location permission denied");
    const { coords } = await Location.getCurrentPositionAsync({});
    return coords;
  }, []);

  const loadWeather = useCallback(
    async (opts = { useGps: usingGps }) => {
      setError("");
      setLoading(true);
      try {
        let data;
        if (opts.useGps) {
          const coords = await requestLocation();
          data = await fetchBundleByCoords(coords.latitude, coords.longitude);
          setUsingGps(true);
        } else if (selectedCity) {
          data = await fetchBundleByCity(selectedCity.name);
          setUsingGps(false);
        } else {
          const coords = await requestLocation();
          data = await fetchBundleByCoords(coords.latitude, coords.longitude);
          setUsingGps(true);
        }
        setBundle(data);
      } catch (e) {
        console.warn(e);
        setError(e.message || "Unable to load weather");
      } finally {
        setLoading(false);
      }
    },
    [requestLocation, selectedCity, usingGps]
  );

  useEffect(() => {
    loadWeather();
  }, [selectedCity]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 5000, useNativeDriver: true })
      ])
    ).start();
  }, [shimmer]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather({ useGps: usingGps });
    setRefreshing(false);
  };

  const saveToFavorites = () => {
    if (!bundle?.name) return;
    const exists = favorites.find((f) => f.name === bundle.name);
    if (exists) return;
    const updated = [...favorites, { name: bundle.name, country: bundle.country }];
    setFavorites(updated);
  };

  const contentReady = bundle && !loading && !error;

  return (
    <LinearGradient colors={gradient} style={styles.flex}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.2] })
          }
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl tintColor="#fff" refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.chip} onPress={() => loadWeather({ useGps: true })}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={theme.textPrimary} />
            <Text style={[styles.chipText, { color: theme.textPrimary }]}>GPS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("Search")}>
            <MaterialCommunityIcons name="magnify" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            <MaterialCommunityIcons
              name={isDark ? "weather-sunny" : "weather-night"}
              size={22}
              color={theme.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.messageBox}>
            <Text style={[styles.message, { color: theme.textPrimary }]}>{error}</Text>
            <TouchableOpacity onPress={() => loadWeather({ useGps: usingGps })} style={styles.retry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {contentReady ? (
          <>
            <WeatherCard city={bundle.name} current={mergedCurrent} theme={theme} />

            <View style={styles.rowBetween}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Favorites
              </Text>
              <TouchableOpacity onPress={saveToFavorites}>
                <MaterialCommunityIcons
                  name="heart-plus"
                  size={20}
                  color={theme.textPrimary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {favorites.length === 0 ? (
                <Text style={{ color: theme.textSecondary }}>No favorites yet</Text>
              ) : (
                favorites.map((city) => (
                  <TouchableOpacity
                    key={city.name}
                    style={[styles.chip, { borderColor: theme.border }]}
                    onPress={() => setSelectedCity(city)}
                  >
                    <Text style={[styles.chipText, { color: theme.textPrimary }]}>{city.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Hourly</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 12 }}
            >
              {bundle.onecall?.hourly?.slice(0, 24).map((hour) => (
                <ForecastCard
                  key={hour.dt}
                  label={formatHour(hour.dt)}
                  tempMin={hour.temp}
                  tempMax={hour.temp}
                  condition={hour.weather?.[0]?.description || "clear"}
                  theme={theme}
                />
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Next 7 days</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 12 }}
            >
              {bundle.onecall?.daily?.slice(0, 7).map((day) => (
                <ForecastCard
                  key={day.dt}
                  label={formatDay(day.dt)}
                  tempMin={day.temp?.min}
                  tempMax={day.temp?.max}
                  condition={day.weather?.[0]?.main || "clear"}
                  theme={theme}
                />
              ))}
            </ScrollView>

            {bundle.onecall?.alerts?.length ? (
              <View style={[styles.alertBox, { borderColor: theme.border }]}>
                <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>Weather alert</Text>
                <Text style={[styles.alertBody, { color: theme.textSecondary }]}>
                  {bundle.onecall.alerts[0].event}: {bundle.onecall.alerts[0].description}
                </Text>
              </View>
            ) : null}
          </>
        ) : loading ? (
          <Text style={[styles.message, { color: theme.textSecondary }]}>Loading...</Text>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, position: "relative" },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBtn: { padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 10
  },
  chipText: { fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  messageBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12
  },
  message: { fontSize: 16 },
  retry: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#00d2ff",
    borderRadius: 12
  },
  retryText: { color: "#0b1021", fontWeight: "700" },
  alertBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  alertTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  alertBody: { fontSize: 13, lineHeight: 18 },
  glow: {
    position: "absolute",
    top: -100,
    left: -50,
    right: -50,
    height: 300,
    borderRadius: 200,
    backgroundColor: "#ffffff",
    transform: [{ scale: 1.2 }]
  }
});

export default HomeScreen;

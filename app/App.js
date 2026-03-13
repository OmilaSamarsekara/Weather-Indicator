import React, { useEffect, useMemo, useState, createContext } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import { themes } from "./styles/theme";

export const AppContext = createContext();
const Stack = createNativeStackNavigator();

const FAVORITES_KEY = "FAVORITE_CITIES_V1";
const THEME_KEY = "THEME_MODE_V1";
const CITY_KEY = "SELECTED_CITY_V1";

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const savedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme === "light") setIsDark(false);
        const savedCity = await AsyncStorage.getItem(CITY_KEY);
        if (savedCity) setSelectedCity(JSON.parse(savedCity));
      } catch (e) {
        console.warn("Failed to load saved data", e);
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, isDark ? "dark" : "light").catch(() => {});
  }, [isDark]);

  useEffect(() => {
    if (selectedCity) {
      AsyncStorage.setItem(CITY_KEY, JSON.stringify(selectedCity)).catch(() => {});
    }
  }, [selectedCity]);

  const theme = useMemo(() => (isDark ? themes.dark : themes.light), [isDark]);

  const contextValue = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme: () => setIsDark((prev) => !prev),
      favorites,
      setFavorites,
      selectedCity,
      setSelectedCity
    }),
    [theme, isDark, favorites, selectedCity]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "transparent" },
            headerTitleStyle: { color: theme.textPrimary },
            headerTransparent: true,
            headerTintColor: theme.textPrimary
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "" }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Search" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY || "YOUR_API_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall";

const buildUrl = (base, path, params = {}) => {
  const url = new URL(path, base);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  return url.toString();
};

const ensureKey = () => {
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    throw new Error("OpenWeatherMap API key is missing. Set EXPO_PUBLIC_OPENWEATHER_KEY.");
  }
};

export const fetchCurrentByCity = async (city, units = "metric") => {
  ensureKey();
  const url = buildUrl(BASE_URL, "/weather", { q: city, units, appid: API_KEY });
  const res = await fetch(url);
  if (!res.ok) throw new Error("City not found");
  const data = await res.json();
  return {
    name: data.name,
    country: data.sys?.country,
    coord: data.coord,
    current: data
  };
};

export const fetchCurrentByCoords = async (lat, lon, units = "metric") => {
  ensureKey();
  const url = buildUrl(BASE_URL, "/weather", { lat, lon, units, appid: API_KEY });
  const res = await fetch(url);
  if (!res.ok) throw new Error("Unable to load current location weather");
  const data = await res.json();
  return {
    name: data.name,
    country: data.sys?.country,
    coord: data.coord,
    current: data
  };
};

export const fetchOneCall = async (lat, lon, units = "metric") => {
  ensureKey();
  const url = buildUrl(ONECALL_URL, "", {
    lat,
    lon,
    units,
    exclude: "minutely",
    appid: API_KEY
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast unavailable");
  return res.json();
};

export const fetchBundleByCity = async (city, units = "metric") => {
  const base = await fetchCurrentByCity(city, units);
  const forecast = await fetchOneCall(base.coord.lat, base.coord.lon, units);
  return {
    ...base,
    onecall: forecast
  };
};

export const fetchBundleByCoords = async (lat, lon, units = "metric") => {
  const base = await fetchCurrentByCoords(lat, lon, units);
  const forecast = await fetchOneCall(lat, lon, units);
  return {
    ...base,
    onecall: forecast
  };
};

export const iconFor = (condition = "clear") => {
  const lower = condition.toLowerCase();
  if (lower.includes("thunder")) return "weather-lightning";
  if (lower.includes("rain")) return "weather-pouring";
  if (lower.includes("drizzle")) return "weather-rainy";
  if (lower.includes("snow")) return "weather-snowy-heavy";
  if (lower.includes("cloud")) return "weather-cloudy";
  if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return "weather-fog";
  if (lower.includes("wind")) return "weather-windy";
  return "weather-sunny";
};

export const isNight = (current) => {
  if (!current || !current.sys) return false;
  const now = Date.now() / 1000;
  return now < current.sys.sunrise || now > current.sys.sunset;
};

export const formatUv = (uvi = 0) => {
  if (uvi < 3) return { level: "Low", color: "#7ad66c" };
  if (uvi < 6) return { level: "Moderate", color: "#ffd166" };
  if (uvi < 8) return { level: "High", color: "#f78c6b" };
  if (uvi < 11) return { level: "Very high", color: "#ef476f" };
  return { level: "Extreme", color: "#9b2c9e" };
};

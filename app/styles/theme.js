export const palettes = {
  clear: ["#4facfe", "#00f2fe"],
  clouds: ["#757f9a", "#d7dde8"],
  rain: ["#667db6", "#0082c8", "#0082c8", "#667db6"],
  thunder: ["#141E30", "#243B55"],
  snow: ["#83a4d4", "#b6fbff"],
  mist: ["#606c88", "#3f4c6b"],
  night: ["#0f2027", "#203a43", "#2c5364"]
};

export const themes = {
  light: {
    background: "#0b1021",
    card: "rgba(255,255,255,0.12)",
    textPrimary: "#f5f7ff",
    textSecondary: "#c8d0e8",
    border: "rgba(255,255,255,0.2)",
    accent: "#8ef1ff",
    shadow: "rgba(0,0,0,0.25)"
  },
  dark: {
    background: "#05060c",
    card: "rgba(255,255,255,0.08)",
    textPrimary: "#e8edff",
    textSecondary: "#b6c2e1",
    border: "rgba(255,255,255,0.18)",
    accent: "#7be0ff",
    shadow: "rgba(0,0,0,0.4)"
  }
};

export const weatherGradients = (condition = "Clear", isNight = false) => {
  const lower = condition.toLowerCase();
  if (isNight) return palettes.night;
  if (lower.includes("thunder")) return palettes.thunder;
  if (lower.includes("rain") || lower.includes("drizzle")) return palettes.rain;
  if (lower.includes("snow")) return palettes.snow;
  if (lower.includes("cloud")) return palettes.clouds;
  if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return palettes.mist;
  return palettes.clear;
};

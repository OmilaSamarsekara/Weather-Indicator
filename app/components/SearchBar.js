import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search city",
  theme
}) => {
  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <MaterialCommunityIcons name="magnify" size={22} color={theme.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Go</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#00d2ff"
  },
  buttonText: { color: "#0b1021", fontWeight: "700" }
});

export default SearchBar;

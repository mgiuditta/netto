import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export default function QuickEntryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quick Entry</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  text: {
    color: Colors.text,
    fontSize: 18,
  },
});

import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Storico</Text>
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

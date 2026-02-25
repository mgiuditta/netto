import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Colors } from "@/constants/colors";
import { useSettingsStore } from "@/stores/settings-store";

export default function OnboardingScreen() {
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Netto</Text>
        <Text style={styles.subtitle}>
          La verità sul tuo saldo.{"\n"}100% privata, 100% tua.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.description}>
          Tieni traccia delle tue spese di gioco in modo semplice e onesto.
          Nessun server, nessun tracciamento. I tuoi dati restano sul tuo dispositivo.
        </Text>

        <Pressable style={styles.button} onPress={completeOnboarding}>
          <Text style={styles.buttonText}>Inizia</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 50,
  },
  top: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 28,
    marginBottom: 24,
  },
  title: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },
  bottom: {
    alignItems: "center",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 14,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});

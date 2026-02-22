import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <View style={[styles.container, type === "success" ? styles.success : styles.error]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    top: 18,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 10
  },
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.danger },
  text: { color: "#0b1020", fontWeight: "700" }
});

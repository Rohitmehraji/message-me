import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10
  }
});

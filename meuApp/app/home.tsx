import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Tela Principal</Text>
      <Text style={styles.subtitle}>Bem-vindo ao aplicativo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 24,
    fontWeight: "bold", 
    color: "#2E8B57" 
  },
  subtitle: { 
    fontSize: 16, 
    marginTop: 10 
  },
});
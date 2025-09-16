import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/login");
    }, 1000); // redireciona em 1s
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#2E8B57" />
      <Text style={{ marginTop: 10 }}>Carregando...</Text>
    </View>
  );
}

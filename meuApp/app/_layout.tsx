import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="recuperar_senha" />
      <Stack.Screen name="usuario" />
    </Stack>
  );
}


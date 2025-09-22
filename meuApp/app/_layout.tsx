import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="logirrn" />
      <Stack.Screen name="home" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="recuperar_senha" />
      <Stack.Screen name="recuperar_senha_codigo" />
      <Stack.Screen name="recuperar_senha_nova.tsx" />
      <Stack.Screen name="usuario" />
      <Stack.Screen name="search"/>

    </Stack>
  );
}


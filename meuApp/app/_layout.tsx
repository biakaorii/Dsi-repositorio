import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="loginScreen" />
      <Stack.Screen name="home" />
    </Stack>
  );
}

// tsconfig.json
{
  "compilerOptions": {
    // other options
    "jsx": "react-jsx"
  }
}

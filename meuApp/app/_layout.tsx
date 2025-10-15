import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function Layout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="recuperar_senha" />
        <Stack.Screen name="usuario" />
        <Stack.Screen name="search"/>
        <Stack.Screen name="select-profile"/>
        <Stack.Screen name="reader-form"/>
        <Stack.Screen name="entrepreneur-form"/>
      </Stack>
      <Toast topOffset={height / 2 - 60} />
    </>
  );
}
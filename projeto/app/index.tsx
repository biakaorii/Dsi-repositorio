import { Text, View, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return <LoginScreen />;


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});

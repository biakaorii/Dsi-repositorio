import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Link } from "expo-router";

export default function BottomNavBar() {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.push('/home')}>
        <Ionicons name="home" size={26} color="#2E7D32" />
      </TouchableOpacity>
      <Link href="/search" asChild>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={26} color="#777" />
        </TouchableOpacity>
      </Link>
      <TouchableOpacity onPress={() => router.push('/progresso')}>
        <Ionicons name="book-outline" size={26} color="#777" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/usuario')}>
        <Ionicons name="person-outline" size={26} color="#777" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
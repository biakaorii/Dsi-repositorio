// components/BottomNavBar.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link, usePathname } from "expo-router";

const navItems = [
  { route: "/home", icon: "home", activeIcon: "home" },
  { route: "/search", icon: "search-outline", activeIcon: "search" },
  { route: "/comunidades", icon: "megaphone-outline", activeIcon: "megaphone" },
  { route: "/progresso", icon: "book-outline", activeIcon: "book" },
  { route: "/cadastrar-livro", icon: "add-circle-outline", activeIcon: "add-circle" },
  { route: "/usuario", icon: "person-outline", activeIcon: "person" },
] as const;

export default function BottomNavBar() {
  const router = useRouter();
  const currentRoute = usePathname();

  const getIconColor = (route: (typeof navItems)[number]["route"]) => {
    return currentRoute === route ? "#2E7D32" : "#777";
  };

  const getIconName = (item: (typeof navItems)[number]) => {
    return currentRoute === item.route ? item.activeIcon : item.icon;
  };

  return (
    <View style={styles.navbar}>
      {navItems.map((item) => {
        if (item.route === "/search") {
          // Usa Link para /search (como no original)
          return (
            <Link key={item.route} href={item.route} asChild>
              <TouchableOpacity>
                <Ionicons
                  name={getIconName(item)}
                  size={26}
                  color={getIconColor(item.route)}
                />
              </TouchableOpacity>
            </Link>
          );
        } else {
          
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route)}
            >
              <Ionicons
                name={getIconName(item)}
                size={26}
                color={getIconColor(item.route)}
              />
            </TouchableOpacity>
          );
        }
      })}
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

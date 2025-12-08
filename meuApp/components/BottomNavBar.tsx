// components/BottomNavBar.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { route: "/home", icon: "home", activeIcon: "home", hideForEntrepreneur: false },
  { route: "/search", icon: "search-outline", activeIcon: "search", hideForEntrepreneur: false },
  { route: "/estantes", icon: "bookmarks-outline", activeIcon: "bookmarks", hideForEntrepreneur: true },
  { route: "/comunidades", icon: "megaphone-outline", activeIcon: "megaphone", hideForEntrepreneur: false },
  { route: "/progresso", icon: "book-outline", activeIcon: "book", hideForEntrepreneur: true },
  { route: "/usuario", icon: "person-outline", activeIcon: "person", hideForEntrepreneur: false },
] as const;

export default function BottomNavBar() {
  const router = useRouter();
  const currentRoute = usePathname();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const isEntrepreneur = user?.profileType === 'empreendedor';

  const getIconColor = (route: string) => {
    return currentRoute === route ? colors.primary : colors.textSecondary;
  };

  const getIconName = (item: typeof navItems[number]) => {
    return currentRoute === item.route ? item.activeIcon : item.icon;
  };

  return (
    <View style={[styles.navbar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {navItems
        .filter(item => !(item.hideForEntrepreneur && isEntrepreneur))
        .map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Ionicons
              name={getIconName(item)}
              size={28}
              color={getIconColor(item.route)}
            />
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});

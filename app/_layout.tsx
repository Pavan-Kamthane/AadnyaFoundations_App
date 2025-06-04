import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const PRIMARY_COLOR = "#3786b6";
const SECONDARY_COLOR = "#8e2273";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: SECONDARY_COLOR,
        tabBarLabelStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donations"
        options={{
          title: "Donations",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contacts",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="call-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="volunteers"
        options={{
          title: "Volunteers",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// styles
const styles = StyleSheet.create({
  tabBar: {
    margin: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: "#fff",
    position: "absolute",
    left: 16,
    right: 16,
    // can you add border to the top of the tab bar
    borderTopWidth: 1,
    borderTopColor: "#3786b6",
  },
});

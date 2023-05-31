import { Tabs } from "expo-router"

import { Search, User } from "lucide-react-native"
import { useColorScheme } from "react-native"

// Returns ReactComponent

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function AppLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  // Prevent rendering until the font has loaded

  return (
    <Tabs
      initialRouteName="(map)"
      sceneContainerStyle={{ flex: 1, backgroundColor: isDark ? "black" : "white" }}
      screenOptions={{
        tabBarLabelStyle: { margin: -4, color: isDark ? "white" : "black" },
        tabBarStyle: { backgroundColor: isDark ? "black" : "white" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(map)"
        options={{
          title: "Explore",
          tabBarIcon: (props) => <Search size={22} color={props.focused ? "green" : isDark ? "white" : "black"} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: (props) => <User size={22} color={props.focused ? "green" : isDark ? "white" : "black"} />,
        }}
      />
      <Tabs.Screen name="spots" options={{ href: null }} />
    </Tabs>
  )
}

import { useColorScheme } from "react-native"
import { Tabs } from "expo-router"
import { PlusCircle, Search, User } from "lucide-react-native"

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
        tabBarStyle: { backgroundColor: isDark ? "black" : "white" },
        headerShown: false,
        tabBarShowLabel: false,
        // tabBarLabelStyle: { margin: -4, color: isDark ? "white" : "black" },
      }}
    >
      <Tabs.Screen
        name="(map)"
        options={{
          tabBarIcon: (props) => <Search size={24} color={props.focused ? "green" : isDark ? "white" : "black"} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          tabBarIcon: (props) => <PlusCircle size={24} color={props.focused ? "green" : isDark ? "white" : "black"} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: (props) => <User size={24} color={props.focused ? "green" : isDark ? "white" : "black"} />,
        }}
      />
    </Tabs>
  )
}

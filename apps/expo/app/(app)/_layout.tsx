import { useColorScheme } from "react-native"
import { SplashScreen, Tabs } from "expo-router"
import { PlusCircle, Search, User } from "lucide-react-native"
import { api } from "../../lib/api"
import { Image } from "expo-image"
import { createImageUrl, join } from "@ramble/shared"
import { EXPO_PROFILE_TAB_ID } from "../../lib/config"

// Returns ReactComponent

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function AppLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  // Prevent rendering until the font has loaded
  const { data, isLoading } = api.auth.me.useQuery()

  if (isLoading) return <SplashScreen />

  console.log({ username: data?.username })
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
        name="[username]"
        options={{
          href: {
            pathname: "/[username]",
            params: { username: data?.username || EXPO_PROFILE_TAB_ID },
          },
          tabBarIcon: (props) =>
            data?.avatar ? (
              <Image
                style={{ width: 26, height: 26 }}
                source={{ uri: createImageUrl(data.avatar) }}
                className={join(
                  "rounded-full border-2 border-transparent bg-gray-100 object-cover",
                  props.focused && "border-green-500",
                )}
              />
            ) : (
              <User size={24} color={props.focused ? "green" : isDark ? "white" : "black"} />
            ),
        }}
      />
    </Tabs>
  )
}

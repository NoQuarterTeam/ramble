import { SafeAreaProvider } from "react-native-safe-area-context"
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_900Black, useFonts } from "@expo-google-fonts/poppins"
import { SplashScreen, Tabs } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { NewUpdate } from "../components/NewUpdate"
import { TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"
import { useColorScheme } from "react-native"
import { Map, User, Settings } from "lucide-react-native"
// Returns ReactComponent

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  })
  const { isDoneChecking, isNewUpdateAvailable } = useCheckExpoUpdates()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  // Prevent rendering until the font has loaded
  if (!fontsLoaded || !isDoneChecking) return <SplashScreen />

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        {isNewUpdateAvailable ? (
          <NewUpdate />
        ) : (
          <Tabs
            sceneContainerStyle={{ backgroundColor: isDark ? "black" : "white" }}
            screenOptions={{
              tabBarLabelStyle: { color: isDark ? "white" : "black" },
              tabBarStyle: { backgroundColor: isDark ? "black" : "white" },
              headerShown: false,
            }}
          >
            <Tabs.Screen
              name="(map)/index"
              options={{
                title: "Map",
                tabBarIcon: (props) => <Map size={20} color={props.focused ? "green" : isDark ? "white" : "black"} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profile",
                tabBarIcon: (props) => <User size={20} color={props.focused ? "green" : isDark ? "white" : "black"} />,
              }}
            />
            <Tabs.Screen
              name="account"
              options={{
                title: "Account",
                tabBarIcon: (props) => <Settings size={20} color={props.focused ? "green" : isDark ? "white" : "black"} />,
              }}
            />
            <Tabs.Screen name="spots" options={{ href: null }} />
          </Tabs>
        )}
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaProvider>
    </TRPCProvider>
  )
}

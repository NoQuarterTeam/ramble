import { View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_900Black, useFonts } from "@expo-google-fonts/poppins"
import { Slot, SplashScreen } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { NewUpdate } from "../components/NewUpdate"
import { TRPCProvider } from "../lib/api"
import { useCheckExpoUpdates } from "../lib/hooks/useCheckExpoUpdates"

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

  // Prevent rendering until the font has loaded
  if (!fontsLoaded || !isDoneChecking) return <SplashScreen />

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        <View className="flex-1 bg-white dark:bg-black">{isNewUpdateAvailable ? <NewUpdate /> : <Slot />}</View>
        <StatusBar />
      </SafeAreaProvider>
    </TRPCProvider>
  )
}

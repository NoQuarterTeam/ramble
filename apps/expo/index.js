import { LogBox } from "react-native"
LogBox.ignoreLogs(["Error: Unable to resolve module", "No native splash screen"])
import "expo-dev-client"

import { registerRootComponent } from "expo"
import RootLayout from "./app/_layout"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootLayout)

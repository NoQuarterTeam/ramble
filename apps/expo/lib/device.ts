import { Dimensions, Platform } from "react-native"

export const width = Dimensions.get("window").width

export const isAndroid = Platform.OS === "android"

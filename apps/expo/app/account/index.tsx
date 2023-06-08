import { View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { useRouter } from "expo-router"
import * as Updates from "expo-updates"

import { Button } from "../../components/Button"
import { ModalView } from "../../components/ModalView"
import { Text } from "../../components/Text"
import { api, AUTH_TOKEN } from "../../lib/api"
import { VERSION } from "../../lib/config"

const updateId = Updates.updateId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateGroup = (Constants.manifest2?.metadata as any)?.["updateGroup"]

export default function Account() {
  const utils = api.useContext()
  const router = useRouter()
  const handleLogout = async () => {
    utils.auth.me.setData(undefined, null)
    await AsyncStorage.removeItem(AUTH_TOKEN)
    router.back()
  }

  return (
    <ModalView title="Account">
      <Button onPress={handleLogout} variant="outline">
        Log out
      </Button>
      <View className="pt-10">
        <Text className="text-center">v{VERSION}</Text>
        <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
      </View>
    </ModalView>
  )
}

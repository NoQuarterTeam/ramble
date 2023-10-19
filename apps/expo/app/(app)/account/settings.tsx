import { Modal, ScrollView, View } from "react-native"

import { useDisclosure } from "@ramble/shared"

import { Button } from "../../../components/ui/Button"
import { ModalView } from "../../../components/ui/ModalView"
import { ScreenView } from "../../../components/ui/ScreenView"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useRouter } from "../../router"

export function AccountSettingsScreen() {
  const modalProps = useDisclosure()
  const router = useRouter()
  const utils = api.useContext()

  const { mutate: deleteAccount, isLoading } = api.user.deleteAccount.useMutation({
    onSuccess: async () => {
      modalProps.onClose()
      router.popToTop()
      utils.user.me.setData(undefined, null)
      toast({ title: "Account deleted." })
    },
  })

  return (
    <ScreenView title="Settings">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="pt-4">
          <Button onPress={modalProps.onOpen}>Delete account</Button>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={modalProps.isOpen}
        onRequestClose={modalProps.onClose}
        onDismiss={modalProps.onClose}
      >
        <ModalView title="are you sure?" onBack={modalProps.onClose}>
          <View className="space-y-2 pt-4">
            <Text>This can't be undone!</Text>
            <Button isLoading={isLoading} onPress={() => deleteAccount()} variant="destructive">
              Confirm
            </Button>
          </View>
        </ModalView>
      </Modal>
    </ScreenView>
  )
}

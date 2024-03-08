import { Check } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import { Modal, ScrollView, TouchableOpacity } from "react-native"

import { type UseDisclosure, languages } from "@ramble/shared"

import { Icon } from "./Icon"
import { ModalView } from "./ui/ModalView"
import { Text } from "./ui/Text"

interface Props {
  modalProps: UseDisclosure
  setSelectedLang: (lang: string) => void
  selectedLanguage: string
}

export function LanguageSelector({ modalProps, ...props }: Props) {
  const posthog = usePostHog()

  return (
    <Modal
      animationType="slide"
      presentationStyle="formSheet"
      visible={modalProps.isOpen}
      onRequestClose={modalProps.onClose}
      onDismiss={modalProps.onClose}
    >
      <ModalView title="select language" onBack={modalProps.onClose}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {languages.map((l) => (
            <TouchableOpacity
              key={l.code}
              onPress={() => {
                posthog?.capture("user language selected", { language: l.code })
                props.setSelectedLang(l.code)
                modalProps.onClose()
              }}
              activeOpacity={0.8}
              className="flex flex-row items-center justify-between border-gray-200 border-b p-4 dark:border-gray-700"
            >
              <Text>{l.name}</Text>
              {l.code === props.selectedLanguage && <Icon icon={Check} size={18} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ModalView>
    </Modal>
  )
}

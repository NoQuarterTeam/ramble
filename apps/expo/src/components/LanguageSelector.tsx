import { Modal, ScrollView, TouchableOpacity } from "react-native"
import { Check } from "lucide-react-native"

import { languages, type UseDisclosure } from "@ramble/shared"

import { Icon } from "./Icon"
import { ModalView } from "./ui/ModalView"
import { Text } from "./ui/Text"

interface Props {
  modalProps: UseDisclosure
  setSelectedLang: (lang: string) => void
  selectedLanguage: string
}

export function LanguageSelector({ modalProps, ...props }: Props) {
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {languages.map((l) => (
            <TouchableOpacity
              key={l.code}
              onPress={() => {
                props.setSelectedLang(l.code)
                modalProps.onClose()
              }}
              activeOpacity={0.8}
              className="flex flex-row items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
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

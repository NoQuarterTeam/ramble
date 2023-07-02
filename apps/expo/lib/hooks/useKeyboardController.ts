import * as React from "react"
import { useFocusEffect } from "@react-navigation/native"
import { AvoidSoftInput } from "react-native-avoid-softinput"

export function useKeyboardController() {
  const onFocusEffect = React.useCallback(() => {
    AvoidSoftInput.setEnabled(true)
    AvoidSoftInput.setAvoidOffset(100)
    AvoidSoftInput.setShouldMimicIOSBehavior(true)
    return () => {
      AvoidSoftInput.setEnabled(false)
      AvoidSoftInput.setAvoidOffset(0)
      AvoidSoftInput.setShouldMimicIOSBehavior(false)
    }
  }, [])

  useFocusEffect(onFocusEffect)
}

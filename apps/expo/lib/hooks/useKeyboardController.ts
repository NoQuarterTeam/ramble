import * as React from "react"
import { AvoidSoftInput } from "react-native-avoid-softinput"
import { useFocusEffect } from "@react-navigation/native"

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

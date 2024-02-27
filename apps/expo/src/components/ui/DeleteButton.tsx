import { Trash2 } from "lucide-react-native"
import { TouchableOpacity, type TouchableOpacityProps } from "react-native"

import { merge } from "@ramble/shared"

import { Icon } from "../Icon"
import { Spinner } from "./Spinner"

interface Props extends TouchableOpacityProps {
  isLoading?: boolean
}

export function DeleteButton(props: Props) {
  return (
    <TouchableOpacity
      {...props}
      className={merge(
        "sq-14 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700",
        props.className,
      )}
    >
      {props.isLoading ? <Spinner /> : <Icon icon={Trash2} color="red" />}
    </TouchableOpacity>
  )
}

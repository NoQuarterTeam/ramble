import * as React from "react"

import type { ApiError } from "~/lib/hooks/useForm"

import { toast } from "./Toast"

interface Props {
  error?: ApiError
}
export function FormError({ error }: Props) {
  const errorToRender = error ? (typeof error === "string" ? error : error.data?.formError) : null
  React.useEffect(() => {
    if (!errorToRender) return
    toast({ title: errorToRender, type: "error" })
  }, [errorToRender])
  return null
  // if (!error || !error.data?.formError) return null

  // return (
  //   <View className="items-center justify-center">
  //     <View
  //       {...props}
  //       className={merge(
  //         "flex flex-row items-center justify-center space-x-1 w-full rounded-sm bg-red-500 py-2 px-4 dark:bg-red-800",
  //         props.className,
  //       )}
  //     >
  //       <Icon icon={AlertTriangle} color="white" size={16} />
  //       <Text className="text-center font-600 text-sm text-white">
  //         {typeof error === "string" ? error : error.data?.formError}
  //       </Text>
  //     </View>
  //   </View>
  // )
}

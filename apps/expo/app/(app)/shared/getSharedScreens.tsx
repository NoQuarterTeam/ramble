import { UsernameLayout } from "./[username]/_layout"
import { ListDetailScreen } from "./lists/[id]"

import { ListDetailMapScreen } from "./lists/[id]/map"

import { SpotDetailScreen } from "./spots/[id]"

// eslint-disable-next-line
export function getSharedScreens(Stack: any) {
  return [
    <Stack.Screen key="UsernameLayout" name="UsernameLayout" component={UsernameLayout} />,
    <Stack.Screen key="SpotDetailScreen" name="SpotDetailScreen" component={SpotDetailScreen} />,
    <Stack.Screen key="ListDetailScreen" name="ListDetailScreen" component={ListDetailScreen} />,
    <Stack.Screen key="ListDetailMapScreen" name="ListDetailMapScreen" component={ListDetailMapScreen} />,
  ]
}

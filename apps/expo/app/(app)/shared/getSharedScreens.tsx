import { UserScreen } from "./[username]"
import { UserFollowers } from "./[username]/followers"
import { UserFollowing } from "./[username]/following"
import { ListDetailScreen } from "./lists/[id]"
import { ListDetailMapScreen } from "./lists/[id]/map"
import { SpotDetailScreen } from "./spots/[id]"

// eslint-disable-next-line
export function getSharedScreens(Stack: any) {
  return [
    <Stack.Screen key="UserScreen" name="UserScreen" component={UserScreen} />,
    <Stack.Screen key="UserFollowers" name="UserFollowers" component={UserFollowers} />,
    <Stack.Screen key="UserFollowing" name="UserFollowing" component={UserFollowing} />,
    <Stack.Screen key="SpotDetailScreen" name="SpotDetailScreen" component={SpotDetailScreen} />,
    <Stack.Screen key="ListDetailScreen" name="ListDetailScreen" component={ListDetailScreen} />,
    <Stack.Screen key="ListDetailMapScreen" name="ListDetailMapScreen" component={ListDetailMapScreen} />,
  ]
}

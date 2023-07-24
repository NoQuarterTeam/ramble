import { useColorScheme } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Heart, List, Map, User } from "lucide-react-native"

import { createImageUrl, join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { OptimizedImage } from "../../components/ui/OptimisedImage"
import { useMe } from "../../lib/hooks/useMe"
import { LatestLayout } from "./latest/_layout"
import { ListsLayout } from "./lists/_layout"
import { MapLayout } from "./map/_layout"
import { AccountLayout } from "./account/_layout"

const Tab = createBottomTabNavigator()

export function AppLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { me } = useMe()

  return (
    <Tab.Navigator
      initialRouteName="MapLayout"
      sceneContainerStyle={{ backgroundColor: isDark ? "black" : "white" }}
      screenOptions={{
        tabBarStyle: { backgroundColor: isDark ? "black" : "white" },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="MapLayout"
        component={MapLayout}
        options={{
          tabBarIcon: (props) => <Map size={24} color={props.focused ? colors.green[600] : isDark ? "white" : "black"} />,
        }}
      />
      <Tab.Screen
        name="LatestLayout"
        component={LatestLayout}
        options={{
          tabBarIcon: (props) => <List size={24} color={props.focused ? colors.green[600] : isDark ? "white" : "black"} />,
        }}
      />
      <Tab.Screen
        name="ListsLayout"
        component={ListsLayout}
        options={{
          tabBarIcon: (props) => <Heart size={24} color={props.focused ? colors.green[600] : isDark ? "white" : "black"} />,
        }}
      />
      <Tab.Screen
        name="AccountLayout"
        component={AccountLayout}
        options={{
          tabBarIcon: (props) =>
            me?.avatar ? (
              <OptimizedImage
                width={40}
                height={40}
                placeholder={me.avatarBlurHash}
                style={{ width: 26, height: 26 }}
                source={{ uri: createImageUrl(me.avatar) }}
                className={join(
                  "rounded-full border-2 border-transparent bg-gray-100 object-cover",
                  props.focused && "border-green-500",
                )}
              />
            ) : (
              <User size={24} color={props.focused ? colors.green[600] : isDark ? "white" : "black"} />
            ),
        }}
      />
    </Tab.Navigator>
  )
}

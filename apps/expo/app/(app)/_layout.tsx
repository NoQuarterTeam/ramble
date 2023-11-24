import { useColorScheme } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Heart, List, Map, UserCircle, Users } from "lucide-react-native"

import { createImageUrl, join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "../../components/Icon"
import { OptimizedImage } from "../../components/ui/OptimisedImage"
import { useMe } from "../../lib/hooks/useMe"
import { useBackgroundColor } from "../../lib/tailwind"
import { AccountLayout } from "./account/_layout"
import { ListsLayout } from "./lists/_layout"
import { MapLayout } from "./map/_layout"
import { SpotsLayout } from "./spots/_layout"
import { GuidesLayout } from "./guides/_layout"

const Tab = createBottomTabNavigator()

export function AppLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { me } = useMe()
  const backgroundColor = useBackgroundColor()
  return (
    <Tab.Navigator
      initialRouteName="MapLayout"
      sceneContainerStyle={{ backgroundColor }}
      screenOptions={{
        tabBarStyle: { backgroundColor, borderTopColor: colors.gray[isDark ? 700 : 200] },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="MapLayout"
        component={MapLayout}
        options={{
          tabBarIcon: (props) => <Icon icon={Map} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tab.Screen
        name="SpotsLayout"
        component={SpotsLayout}
        options={{
          tabBarIcon: (props) => <Icon icon={List} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tab.Screen
        name="ListsLayout"
        component={ListsLayout}
        options={{
          tabBarIcon: (props) => <Icon icon={Heart} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tab.Screen
        name="GuidesLayout"
        component={GuidesLayout}
        options={{
          tabBarIcon: (props) => <Icon icon={Users} size={22} color={!!props.focused && "primary"} />,
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
                  props.focused && "border-primary-500",
                )}
              />
            ) : (
              <Icon icon={UserCircle} size={22} color={props.focused ? "primary" : isDark ? "white" : "black"} />
            ),
        }}
      />
    </Tab.Navigator>
  )
}

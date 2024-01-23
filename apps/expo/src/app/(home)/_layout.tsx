import { useColorScheme } from "react-native"

import { Heart, List, Map, UserCircle, Users } from "lucide-react-native"

import { createImageUrl, join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Tabs } from "expo-router"
import { Icon } from "../../components/Icon"
import { OptimizedImage } from "../../components/ui/OptimisedImage"
import { useMe } from "../../lib/hooks/useMe"
import { useBackgroundColor } from "../../lib/tailwind"

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "map",
}

export default function HomeLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { me } = useMe()
  const backgroundColor = useBackgroundColor()
  return (
    <Tabs
      initialRouteName="(map)"
      sceneContainerStyle={{ backgroundColor }}
      screenOptions={{
        tabBarStyle: { backgroundColor, borderTopColor: colors.gray[isDark ? 700 : 200] },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(map)"
        options={{
          tabBarIcon: (props) => <Icon icon={Map} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="spots"
        options={{
          tabBarIcon: (props) => <Icon icon={List} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          tabBarIcon: (props) => <Icon icon={Heart} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          tabBarIcon: (props) => <Icon icon={Users} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="account"
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
    </Tabs>
  )
}

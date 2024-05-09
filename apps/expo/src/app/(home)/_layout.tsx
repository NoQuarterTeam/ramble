import { Tabs, useRouter } from "expo-router"
import { List, Map as MapIcon, Route, UserCircle, Users } from "lucide-react-native"
import { useColorScheme } from "react-native"

import { createAssetUrl, join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { useMe } from "~/lib/hooks/useMe"

import { useBackgroundColor } from "../../lib/tailwind"

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(index)",
}

export default function HomeLayout() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { me } = useMe()
  const backgroundColor = useBackgroundColor()
  return (
    <Tabs
      initialRouteName="(index)"
      screenListeners={{
        tabPress: () => {
          if (router.canDismiss()) {
            router.dismissAll()
          }
        },
      }}
      sceneContainerStyle={{ backgroundColor }}
      screenOptions={{
        tabBarStyle: { backgroundColor, borderTopColor: colors.gray[isDark ? 700 : 200] },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          tabBarIcon: (props) => <Icon icon={MapIcon} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="(spots)"
        options={{
          tabBarIcon: (props) => <Icon icon={List} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="(trips)"
        options={{
          tabBarIcon: (props) => <Icon icon={Route} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="(guides)"
        options={{
          tabBarIcon: (props) => <Icon icon={Users} size={22} color={!!props.focused && "primary"} />,
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          tabBarIcon: (props) =>
            me?.avatar ? (
              <OptimizedImage
                width={40}
                height={40}
                placeholder={me.avatarBlurHash}
                style={{ width: 26, height: 26 }}
                source={{ uri: createAssetUrl(me.avatar) }}
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

import { View } from "react-native"
import { Heading } from "../../../components/Heading"
import { api } from "../../../lib/api"
import { Text } from "../../../components/Text"
import { Link } from "../../../components/Link"

export default function Profile() {
  const me = api.auth.me.useQuery()
  return (
    <View>
      <Heading className="text-3xl">Profile</Heading>
      {me.data ? (
        <View>
          <Text>{me.data.username}</Text>
        </View>
      ) : (
        <View>
          <Link href="/login">Login</Link>
        </View>
      )}
    </View>
  )
}

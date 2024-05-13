import { LinkButton } from "@/components/LinkButton"
import { Avatar } from "@/components/ui"
import { prisma } from "@ramble/database"
import { createAssetUrl } from "@ramble/shared"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"

export default async function Page({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, email: true, firstName: true, lastName: true, username: true, avatar: true, createdAt: true },
  })
  if (!user) redirect("/admin/users")
  return (
    <div>
      <LinkButton variant="outline" leftIcon={<ArrowLeft size={16} />} href="/admin/users">
        Back
      </LinkButton>
      <div className="p-4">
        <Avatar src={createAssetUrl(user.avatar)} className="w-20 h-20" />
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>
          {user.firstName} {user.lastName}
        </p>
      </div>
    </div>
  )
}

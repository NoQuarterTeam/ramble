"use client"

import { CloseButton } from "@/components/ui"
import { useRouter } from "next/navigation"

export function SpotContainer(props: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="absolute top-0 bottom-0 left-0 z-10 w-full max-w-lg overflow-scroll border-r bg-background p-4 pb-20 md:px-8">
      <CloseButton className="absolute top-2 right-2 z-10" onClick={() => router.push("/")} />
      {props.children}
    </div>
  )
}

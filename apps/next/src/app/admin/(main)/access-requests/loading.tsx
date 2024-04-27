import { Spinner } from "@/components/ui"

export default function Page() {
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Access requests</h1>
      <div className="p-8 w-full flex items-center justify-center">
        <Spinner />
      </div>
    </div>
  )
}

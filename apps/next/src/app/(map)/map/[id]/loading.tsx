import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-12 w-3/12 rounded-full" />
        <Skeleton className="h-12 w-11/12" />
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex h-[225px] w-full space-x-2 overflow-hidden rounded-xs">
        <Skeleton className="h-[225px] min-w-[350px]" />
        <Skeleton className="h-[225px] min-w-[100px]" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="flex justify-end">
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="py-4">
        <hr />
      </div>

      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function AssistantLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-6">
      <div className="flex flex-1 flex-col">
        <Card className="mb-4 p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </Card>
        <Card className="flex-1">
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
        </Card>
      </div>
    </div>
  )
}

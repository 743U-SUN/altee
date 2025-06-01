import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ProductListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-5 w-10" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <div className="flex gap-2 w-full">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

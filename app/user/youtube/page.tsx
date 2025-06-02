"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { Suspense, lazy } from "react"

// YouTubeコンポーネントを遅延ロード
const ChannelSettings = lazy(() => import("./components/ChannelSettings").then(module => ({ default: module.ChannelSettings })));
const RecommendSettings = lazy(() => import("./components/RecommendSettings").then(module => ({ default: module.RecommendSettings })));

// YouTubeコンポーネントのスケルトンローダー
const YoutubeSettingSkeleton = () => (
  <div className="space-y-4 py-4">
    <Skeleton className="h-4 w-3/4 mb-3" />
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export default function YoutubePage() {
  const { data: session, status } = useSession();

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">YouTube設定</h1>
        <YoutubeSettingSkeleton />
      </div>
    );
  }

  // Unauthenticated state - セキュリティガイド準拠
  if (status === 'unauthenticated' || !session?.user?.id) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">YouTube設定</h1>
        <p className="text-gray-600">ログインが必要です。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">YouTube設定</h1>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="channel" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">YouTubeチャンネル設定</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={<YoutubeSettingSkeleton />}>
              <ChannelSettings userId={session.user.id} />
            </Suspense>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recommend" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">おすすめYouTube動画</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={<YoutubeSettingSkeleton />}>
              <RecommendSettings userId={session.user.id} />
            </Suspense>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

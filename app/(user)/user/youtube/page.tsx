"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChannelSettings } from "./components/ChannelSettings"
import { RecommendSettings } from "./components/RecommendSettings"
import { useSession } from "next-auth/react"

export default function YoutubePage() {
  const { data: session } = useSession();

  if (!session?.user?.id) {
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
            <ChannelSettings userId={session.user.id} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recommend" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">おすすめYouTube動画</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <RecommendSettings userId={session.user.id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

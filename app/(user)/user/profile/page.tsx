"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { NameSettings } from "./components/NameSettings"
import { BioSettings } from "./components/BioSettings"
import { IconSettings } from "./components/IconSettings"
import { BannerSettings } from "./components/BannerSettings"
import { CarouselSettings } from "./components/CarouselSettings"
import { BackgroundSettings } from "./components/BackgroundSettings"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userIcon, setUserIcon] = useState<string>('');

  // セッションとDBから最新のiconUrlを取得
  useEffect(() => {
    const fetchUserIcon = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}/icon`);
          if (response.ok) {
            const data = await response.json();
            setUserIcon(data.iconUrl || '');
          } else {
            // APIがない場合はセッションから取得
            setUserIcon(session.user.iconUrl || '');
          }
        } catch (error) {
          // エラーの場合はセッションから取得
          setUserIcon(session.user.iconUrl || '');
        }
      }
    };

    fetchUserIcon();
  }, [session]);

  const handleIconUpdate = (newIconUrl: string) => {
    setUserIcon(newIconUrl);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">プロフィール設定</h1>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="name" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">名前</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <NameSettings />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bio" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">自己紹介</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <BioSettings />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="icon" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">アイコン</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {session?.user?.id && (
              <IconSettings 
                currentIconUrl={userIcon}
                userId={session.user.id}
                onIconUpdate={handleIconUpdate}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="banner" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">バナー</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <BannerSettings />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="carousel" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">カルーセル</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CarouselSettings />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="background" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">背景</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <BackgroundSettings />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
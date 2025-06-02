"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { NameSettings } from "./components/NameSettings"
import { BioSettings } from "./components/BioSettings"
import { BackgroundSettings } from "./components/BackgroundSettings"
import { useSession } from "next-auth/react"
import { useState, useEffect, Suspense, lazy } from "react"

// 重いコンポーネントを遅延ロード
const IconSettings = lazy(() => import("./components/IconSettings").then(module => ({ default: module.IconSettings })));
const BannerSettings = lazy(() => import("./components/BannerSettings").then(module => ({ default: module.BannerSettings })));
const CarouselSettings = lazy(() => import("./components/CarouselSettings").then(module => ({ default: module.CarouselSettings })));
const CustomQuestion = lazy(() => import("./components/CustomQuestion").then(module => ({ default: module.CustomQuestion })));
const ImageSidebarSettings = lazy(() => import("./components/ImageSidebarSettings").then(module => ({ default: module.ImageSidebarSettings })));

// スケルトンローダー
const SettingSkeleton = () => (
  <div className="space-y-4 py-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const LargeSettingSkeleton = () => (
  <div className="space-y-4 py-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userIcon, setUserIcon] = useState<string>('');

  // セッションとDBから最新のiconUrlとbannerUrlを取得
  useEffect(() => {
    const fetchUserData = async () => {
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

    fetchUserData();
  }, [session]);

  const handleIconUpdate = (newIconUrl: string) => {
    setUserIcon(newIconUrl);
  };

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">プロフィール設定</h1>
        <div className="w-full space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg px-6 py-4">
              <LargeSettingSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Unauthenticated state - セキュリティガイド準拠
  if (status === 'unauthenticated' || !session?.user?.id) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">プロフィール設定</h1>
        <p className="text-gray-600">ログインが必要です。</p>
      </div>
    );
  }

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

        <AccordionItem value="qa" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">Q&A</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {session?.user?.id && (
              <Suspense fallback={<LargeSettingSkeleton />}>
                <CustomQuestion 
                  userId={session.user.id}
                />
              </Suspense>
            )}
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
              <Suspense fallback={<LargeSettingSkeleton />}>
                <IconSettings 
                  currentIconUrl={userIcon}
                  userId={session.user.id}
                  onIconUpdate={handleIconUpdate}
                />
              </Suspense>
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
            {session?.user?.id && (
              <Suspense fallback={<LargeSettingSkeleton />}>
                <BannerSettings 
                  userId={session.user.id}
                />
              </Suspense>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="carousel" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">カルーセル</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {session?.user?.id && (
              <Suspense fallback={<LargeSettingSkeleton />}>
                <CarouselSettings 
                  userId={session.user.id}
                />
              </Suspense>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sidebar" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">サイドバーイメージ</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {session?.user?.id && (
              <Suspense fallback={<LargeSettingSkeleton />}>
                <ImageSidebarSettings 
                  userId={session.user.id}
                />
              </Suspense>
            )}
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
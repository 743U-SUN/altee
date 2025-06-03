import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HandlePageClient from "./components/HandlePageClient";
import { autoUpdateYouTubeVideos, getUserBanners } from "@/lib/actions/handle-actions";
import { getUserPageBackground } from "@/lib/actions/background-actions";
import { UserProfileData } from "./types";

interface HandlePageProps {
  params: Promise<{
    handle: string;
  }>;
}

// ユーザーデータを取得する関数
async function getUserData(handle: string): Promise<UserProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      characterName: true,
      subname: true,
      bio: true,
      iconUrl: true,
      customQuestions: {
        orderBy: { sortOrder: 'asc' },
      },
      links: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          icon: {
            select: {
              id: true,
              filePath: true,
              name: true,
            },
          },
        },
      },
      youtubeSettings: {
        include: {
          videos: {
            orderBy: { publishedAt: 'desc' },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return user as UserProfileData;
}

export default async function HandlePage({ params }: HandlePageProps) {
  const { handle } = await params;
  const userData = await getUserData(handle);

  if (!userData) {
    notFound();
  }

  // バナーデータを取得
  const banners = await getUserBanners(handle);
  
  // 背景設定を取得
  const backgroundSettings = await getUserPageBackground(userData.id, "home");

  // YouTube動画の自動更新をバックグラウンドで実行（エラーがあってもページ表示に影響しない）
  autoUpdateYouTubeVideos(handle).catch((error) => {
    console.error('YouTube auto-update error:', error);
  });

  return <HandlePageClient userData={userData} banners={banners} backgroundSettings={backgroundSettings} />;
}

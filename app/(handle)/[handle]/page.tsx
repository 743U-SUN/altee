import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HandlePageClient from "./components/HandlePageClient";
import { UserProfileData } from "./types";

interface HandlePageProps {
  params: {
    handle: string;
  };
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
  const userData = await getUserData(params.handle);

  if (!userData) {
    notFound();
  }

  return <HandlePageClient handle={params.handle} userData={userData} />;
}

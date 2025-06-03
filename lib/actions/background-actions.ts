"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { BackgroundSettings, PageType, UserPageBackground } from "@/types/background";

const backgroundSettingsSchema = z.object({
  pageType: z.enum(["home", "device", "info", "video"]),
  backgroundType: z.enum(["solid", "pattern"]),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  patternType: z.enum([
    "dots", "stripes-vertical", "stripes-horizontal", "stripes-diagonal", "stripes-diagonal-reverse",
    "geometric", "grid", "grid-bold"
  ]).optional(),
  patternColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  patternOpacity: z.number().min(0).max(1).optional(),
  patternSize: z.number().min(0.5).max(10).optional()
});

export async function updateUserPageBackground(
  pageType: PageType,
  settings: BackgroundSettings
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validatedData = backgroundSettingsSchema.parse({
    pageType,
    ...settings
  });

  const background = await prisma.userPageBackground.upsert({
    where: {
      userId_pageType: {
        userId: session.user.id,
        pageType: validatedData.pageType
      }
    },
    update: {
      backgroundType: validatedData.backgroundType,
      backgroundColor: validatedData.backgroundColor,
      patternType: validatedData.patternType || null,
      patternColor: validatedData.patternColor || "#000000",
      patternOpacity: validatedData.patternOpacity ?? 0.1,
      patternSize: validatedData.patternSize ?? 1.0
    },
    create: {
      userId: session.user.id,
      pageType: validatedData.pageType,
      backgroundType: validatedData.backgroundType,
      backgroundColor: validatedData.backgroundColor,
      patternType: validatedData.patternType || null,
      patternColor: validatedData.patternColor || "#000000",
      patternOpacity: validatedData.patternOpacity ?? 0.1,
      patternSize: validatedData.patternSize ?? 1.0
    }
  });

  // ユーザーのhandle取得してrevalidate
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { handle: true }
  });

  if (user?.handle) {
    revalidatePath(`/${user.handle}`);
    if (pageType === "device") revalidatePath(`/${user.handle}/device`);
    if (pageType === "info") revalidatePath(`/${user.handle}/info`);
    if (pageType === "video") revalidatePath(`/${user.handle}/video`);
  }

  return background;
}

export async function getUserPageBackground(
  userId: string,
  pageType: PageType
): Promise<UserPageBackground | null> {
  const background = await prisma.userPageBackground.findUnique({
    where: {
      userId_pageType: {
        userId,
        pageType
      }
    }
  });

  return background;
}

export async function getUserPageBackgrounds(
  userId: string
): Promise<UserPageBackground[]> {
  const backgrounds = await prisma.userPageBackground.findMany({
    where: { userId },
    orderBy: { pageType: "asc" }
  });

  return backgrounds;
}
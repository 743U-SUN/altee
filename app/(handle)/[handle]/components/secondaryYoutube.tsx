"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { convertToProxyUrl } from "@/lib/utils/image-proxy";
import { UserYoutubeVideo } from "../types";
import { PlayCircle, ChevronRight } from "lucide-react";

interface SecondaryYoutubeProps {
  videos: UserYoutubeVideo[];
  displayCount: number;
  handle: string | null;
}

export default function SecondaryYoutube({ videos, displayCount, handle }: SecondaryYoutubeProps) {
  // publishedAtでソート（新しい順）し、displayCount分だけ表示
  const displayVideos = [...videos]
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, displayCount);

  if (displayVideos.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* 動画グリッド */}
      <div className="@container">
        <div className="grid gap-4 grid-cols-1 @[1280px]:grid-cols-4 @[768px]:grid-cols-3 @[600px]:grid-cols-2">
          {displayVideos.map((video) => (
            <Link
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="overflow-hidden h-full py-0 gap-3">
                {/* サムネイル */}
                <div className="relative aspect-video bg-muted">
                  {video.thumbnailUrl ? (
                    <OptimizedImage
                      src={convertToProxyUrl(video.thumbnailUrl)}
                      alt={video.title || "YouTube video"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {/* ホバー時のオーバーレイ */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* タイトル */}
                <div className="p-3 pt-0">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title || "動画タイトル"}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* もっと見るボタン */}
      {handle && videos.length > displayCount && (
        <div className="flex justify-center">
          <Link href={`/${handle}/video`}>
            <Button variant="outline" className="gap-2">
              もっと見る
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

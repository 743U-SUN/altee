"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { convertToProxyUrl } from "@/lib/utils/image-proxy";
import { UserLinkWithRelations } from "../types";
import { ExternalLink } from "lucide-react";

interface SecondaryLinksProps {
  links: UserLinkWithRelations[];
}

export default function SecondaryLinks({ links }: SecondaryLinksProps) {
  // sortOrderでソートし、isActiveなものだけフィルター
  const activeLinks = links
    .filter(link => link.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <div className="w-full @container">
      <div className="grid gap-4 @[1280px]:grid-cols-4 @[768px]:grid-cols-3 @[600px]:grid-cols-2">
        {activeLinks.map((link) => (
          <Link
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="p-4 h-full transition-colors hover:bg-accent">
              <div className="flex items-center gap-4">
                {/* アイコン */}
                <div className="flex-shrink-0 w-12 h-12 relative">
                  {link.useOriginalIcon && link.originalIconUrl ? (
                    <OptimizedImage
                      src={convertToProxyUrl(link.originalIconUrl)}
                      alt={link.service.name}
                      fill
                      className="rounded-md object-contain"
                      sizes="48px"
                    />
                  ) : link.icon ? (
                    <OptimizedImage
                      src={convertToProxyUrl(link.icon.filePath)}
                      alt={link.icon.name}
                      fill
                      className="rounded-md object-contain"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full rounded-md bg-muted flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* タイトルと説明 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:underline">
                    {link.title || link.service.name}
                  </h3>
                  {link.description && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {link.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

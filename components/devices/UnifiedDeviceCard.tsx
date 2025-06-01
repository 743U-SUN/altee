"use client";

import { useState } from "react";
import Link from "next/link";
import { DisplayDevice } from "@/types/device";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ExternalLink, 
  Info, 
  Crown, 
  User,
  Eye
} from "lucide-react";
import { DeviceIcon } from "./DeviceIcon";
import { DeviceDetails } from "./DeviceDetails";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";
import { convertToProxyUrl } from "@/lib/utils/image-proxy";

interface UnifiedDeviceCardProps {
  device: DisplayDevice;
  showNote?: boolean;
  showActions?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
  showFavorite?: boolean;
  initialFavorited?: boolean;
  onFavoriteToggle?: (isFavorited: boolean) => void;
  showDetails?: boolean;
  compactMode?: boolean;
  className?: string;
}

export function UnifiedDeviceCard({
  device,
  showNote = false,
  showActions = false,
  selectable = false,
  selected = false,
  onSelectionChange,
  onEdit,
  onDelete,
  compact = false,
  showFavorite = false,
  initialFavorited = false,
  onFavoriteToggle,
  showDetails: showDetailsProp = true,
  compactMode = false,
  className,
}: UnifiedDeviceCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const finalCompact = compact || compactMode;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <>
      <Card className={cn(
        "transition-all",
        selectable && "cursor-pointer hover:shadow-md",
        selected && "ring-2 ring-primary",
        className
      )}>
        <CardHeader className={cn("space-y-2", finalCompact && "pb-3")}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <DeviceIcon category={device.category} className="h-5 w-5" />
            </div>
            
            <div className="flex items-center gap-2">
              {showFavorite && device.productId && (
                <FavoriteButton
                  productId={device.productId}
                  initialFavorited={initialFavorited}
                  onToggle={onFavoriteToggle}
                  size="sm"
                  variant="ghost"
                />
              )}
              {selectable && (
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => onSelectionChange?.(checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-3", finalCompact && "pb-3")}>
          <div 
            className={cn(
              "aspect-square relative overflow-hidden rounded-lg bg-muted",
              finalCompact && "aspect-[4/3]"
            )}
          >
            <OptimizedImage
              src={convertToProxyUrl(imageError ? '/images/no-image.svg' : device.imageUrl)}
              alt={device.title || 'デバイス画像'}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={false}
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold line-clamp-1",
              finalCompact && "text-sm"
            )}>
              {device.title}
            </h3>
            
            <div className="h-6 flex items-center">
              {device.color ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">カラー:</span>
                  <div className="flex items-center gap-1">
                    {device.color.hexCode && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: device.color.hexCode }}
                      />
                    )}
                    <span className="text-sm font-medium line-clamp-1">{device.color.name}</span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground opacity-50">カラー: 未設定</span>
              )}
            </div>
            
            <div className="h-6 flex items-center">
              {showNote && device.note ? (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  <span className="font-medium">メモ:</span> {device.note}
                </p>
              ) : (
                <span className="text-sm text-muted-foreground opacity-50">メモ: 未設定</span>
              )}
            </div>
          </div>

          {/* 主要属性の表示 */}
          {!finalCompact && device.attributes && Object.keys(device.attributes).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {device.category === "mouse" && (
                <>
                  {device.attributes.dpi_max && (
                    <Badge variant="outline" className="text-xs">
                      最大 {device.attributes.dpi_max} DPI
                    </Badge>
                  )}
                  {device.attributes.connection_type && (
                    <Badge variant="outline" className="text-xs">
                      {device.attributes.connection_type === "wireless" ? "無線" : 
                       device.attributes.connection_type === "wired" ? "有線" : "有線/無線"}
                    </Badge>
                  )}
                </>
              )}
              {device.category === "keyboard" && (
                <>
                  {device.attributes.layout && (
                    <Badge variant="outline" className="text-xs">
                      {device.attributes.layout}
                    </Badge>
                  )}
                  {device.attributes.switch_type && (
                    <Badge variant="outline" className="text-xs">
                      {device.attributes.switch_type === "mechanical" ? "メカニカル" :
                       device.attributes.switch_type === "optical" ? "光学" :
                       device.attributes.switch_type}
                    </Badge>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className={cn(
          "flex flex-wrap gap-2",
          finalCompact && "pt-3"
        )}>
          {showDetailsProp && device.sourceType === 'official' && (
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                詳細
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{device.title}</DialogTitle>
                <DialogDescription>
                  デバイスの詳細情報
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* 商品画像 */}
                <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                  <OptimizedImage
                    src={convertToProxyUrl(imageError ? '/images/no-image.svg' : device.imageUrl)}
                    alt={device.title || 'デバイス画像'}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-contain p-8"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
                
                {/* メモ */}
                {device.note && (
                  <div>
                    <h3 className="font-medium mb-2">メモ</h3>
                    <p className="text-sm text-muted-foreground">
                      {device.note}
                    </p>
                  </div>
                )}
                
                {/* 説明 */}
                {device.description && (
                  <div>
                    <h3 className="font-medium mb-2">説明</h3>
                    <p className="text-sm text-muted-foreground">
                      {device.description}
                    </p>
                  </div>
                )}
                
                {/* 詳細スペック */}
                <div>
                  <h3 className="font-medium mb-2">スペック</h3>
                  <DeviceDetails 
                    category={device.category} 
                    attributes={device.attributes} 
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}

          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <a
              href={device.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Amazon
            </a>
          </Button>

          {showActions && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  編集
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                >
                  削除
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DisplayDevice } from "@/types/device";
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
  ShoppingCart,
  Eye
} from "lucide-react";
import { DeviceIcon } from "./DeviceIcon";
import { DeviceDetails } from "./DeviceDetails";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

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
              <Badge variant={device.sourceType === "official" ? "default" : "secondary"}>
                {device.sourceType === "official" ? (
                  <>
                    <Crown className="mr-1 h-3 w-3" />
                    公式
                  </>
                ) : (
                  <>
                    <User className="mr-1 h-3 w-3" />
                    カスタム
                  </>
                )}
              </Badge>
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
            <Image
              src={imageError ? '/images/no-image.svg' : device.imageUrl}
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

          <div>
            <h3 className={cn(
              "font-semibold line-clamp-2",
              finalCompact && "text-sm"
            )}>
              {device.title}
            </h3>
            
            {device.description && !finalCompact && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {device.description}
              </p>
            )}
            
            {showNote && device.note && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">メモ:</span> {device.note}
              </p>
            )}
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
                  <Image
                    src={imageError ? '/images/no-image.svg' : device.imageUrl}
                    alt={device.title || 'デバイス画像'}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px" // sizes prop を追加
                    className="object-contain p-8"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
                
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
              <ShoppingCart className="mr-2 h-4 w-4" />
              購入
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

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  className
}) => {
  return (
    <div className={cn(
      "w-full flex flex-col items-center text-center px-4 md:px-6",
      className
    )}>
      {/* アバターとステータスの装飾 */}
      <div className="relative mb-6">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg">
          <AvatarImage src="/vercel.svg" alt="VTuber" />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-600 text-white text-2xl">VT</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md animate-pulse">
          Live Now
        </div>
      </div>
      
      {/* メインタイトル */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text mb-4">
        Altee
      </h1>
      
      {/* サブタイトル */}
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8">
        VTuberのためのリンク集＆グループ管理ツール
      </p>
      
      {/* 機能ハイライト */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
        <div className="bg-background border rounded-full px-4 py-1 text-sm">✨ 魅力的なリンクページ</div>
        <div className="bg-background border rounded-full px-4 py-1 text-sm">🔄 簡単カスタマイズ</div>
        <div className="bg-background border rounded-full px-4 py-1 text-sm">👥 グループ管理機能</div>
        <div className="bg-background border rounded-full px-4 py-1 text-sm">📈 視聴者分析</div>
      </div>
      
      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg">
          無料で始める
        </Button>
        <Button variant="outline" size="lg">
          デモを見る
        </Button>
      </div>
    </div>
  );
};
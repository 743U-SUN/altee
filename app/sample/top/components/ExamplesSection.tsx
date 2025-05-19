import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

interface ExamplesSectionProps {
  className?: string;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  className
}) => {
  // サンプルVTuberプロフィール
  const examples = [
    {
      name: "月野うさぎ",
      avatar: "/vercel.svg",
      category: "ゲーム実況",
      image: "https://placehold.co/600x400/9333ea/ffffff?text=月野うさぎ",
      followers: "12.5K",
      links: ["YouTube", "Twitter", "Twitch", "Instagram"]
    },
    {
      name: "星空みゆき",
      avatar: "/vercel.svg",
      category: "歌ってみた",
      image: "https://placehold.co/600x400/ec4899/ffffff?text=星空みゆき",
      followers: "8.2K",
      links: ["YouTube", "Twitter", "TikTok", "Spotify"]
    },
    {
      name: "VTuberグループ「Stellar」",
      avatar: "/vercel.svg",
      category: "エンタメグループ",
      image: "https://placehold.co/600x400/3b82f6/ffffff?text=Stellar",
      followers: "25K",
      links: ["YouTube", "Twitter", "Discord", "Merch Store"]
    }
  ];

  return (
    <div className={cn(
      "w-full px-4 md:px-6",
      className
    )}>
      {/* セクションタイトル */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">使用例</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          人気VTuberたちは、Alteeを使ってファンとのつながりを強化しています。
          あなたも参加して、VTuber活動をレベルアップさせましょう。
        </p>
      </div>
      
      {/* 例示カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <Card key={index} className="overflow-hidden border hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="relative pt-[56.25%]"> {/* 16:9アスペクト比 (9/16*100%) */}
                <img 
                  src={example.image} 
                  alt={example.name} 
                  className="absolute inset-0 object-cover w-full h-full"
                />
              </div>
              <Badge className="absolute top-3 right-3 bg-black/70 hover:bg-black/70">
                {example.followers} フォロワー
              </Badge>
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={example.avatar} alt={example.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {example.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{example.name}</h3>
                  <p className="text-sm text-muted-foreground">{example.category}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {example.links.map((link, i) => (
                  <Badge key={i} variant="outline" className="bg-background">
                    {link}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
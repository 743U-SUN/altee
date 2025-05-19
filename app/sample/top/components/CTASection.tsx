import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface CTASectionProps {
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  className
}) => {
  // 料金プラン
  const plans = [
    {
      name: "Free",
      price: "¥0",
      description: "VTuber活動を始めたばかりの方に",
      features: [
        "基本的なLinkInBioページ",
        "最大5つのリンク",
        "基本的なカスタマイズ",
        "基本的な訪問者統計"
      ],
      buttonText: "無料で始める",
      highlighted: false
    },
    {
      name: "Pro",
      price: "¥1,500",
      period: "/月",
      description: "活動を拡大したいVTuberに",
      features: [
        "高度なカスタマイズオプション",
        "無制限のリンク",
        "独自ドメイン対応",
        "詳細な分析ダッシュボード",
        "優先サポート",
        "グループ機能（最大3人）"
      ],
      buttonText: "Proを選択",
      highlighted: true
    },
    {
      name: "Team",
      price: "¥4,000",
      period: "/月",
      description: "複数のVTuberを管理するチーム向け",
      features: [
        "すべてのPro機能を含む",
        "無制限のグループメンバー",
        "チーム管理ダッシュボード",
        "複数管理者アカウント",
        "API連携機能",
        "専属サポート"
      ],
      buttonText: "チームプランへ",
      highlighted: false
    }
  ];

  return (
    <div className={cn(
      "w-full px-4 md:px-6",
      className
    )}>
      {/* セクションタイトル */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">今すぐ始めましょう</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          あなたのVTuber活動に最適なプランをお選びください。
          いつでもアップグレードやダウングレードが可能です。
        </p>
      </div>
      
      {/* 料金プラン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <Card key={index} className={cn(
            "p-6 relative overflow-hidden border transition-all duration-300",
            plan.highlighted ? "shadow-lg border-primary" : "hover:shadow-md"
          )}>
            {plan.highlighted && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                人気
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
              </div>
              <p className="text-muted-foreground mt-2">{plan.description}</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={cn(
                "w-full", 
                plan.highlighted 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                  : "bg-muted hover:bg-muted/90 text-foreground"
              )}
            >
              {plan.buttonText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
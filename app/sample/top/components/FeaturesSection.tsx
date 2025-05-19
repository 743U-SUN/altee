import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Link, Palette, Users, BarChart } from 'lucide-react';

interface FeaturesSectionProps {
  className?: string;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  className
}) => {
  // 機能一覧
  const features = [
    {
      icon: Link,
      title: "LinkInBio ページ作成",
      description: "ファンが見つけやすいカスタマイズ可能なリンク集ページを簡単に作成できます。ストリーミングプラットフォーム、SNS、グッズストアなど、あなたのすべてのリンクを1つの場所に集約できます。"
    },
    {
      icon: Palette,
      title: "簡単カスタマイズ",
      description: "コーディング知識なしで、ドラッグ＆ドロップのシンプルな操作で独自のスタイルを作成できます。色、フォント、レイアウトを自由にアレンジして、あなたのブランドカラーに合わせたデザインが可能です。"
    },
    {
      icon: Users,
      title: "VTuberグループ管理",
      description: "グループに所属するVTuberの管理が簡単にできます。メンバー情報の一括更新、グループページの作成、共同イベントの告知など、チームでの活動をサポートする機能が充実しています。"
    },
    {
      icon: BarChart,
      title: "分析ダッシュボード",
      description: "どのリンクが最も人気があるか、訪問者数の推移、訪問時間帯など詳細な分析情報を確認できます。ファンの行動パターンを理解して、コンテンツ戦略の最適化に役立てましょう。"
    }
  ];

  return (
    <div className={cn(
      "w-full px-4 md:px-6",
      className
    )}>
      {/* セクションタイトル */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">VTuber活動をもっと簡単に</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Alteeは、VTuberのためのオールインワンプラットフォームです。
          ファンとの繋がりを強化し、活動の幅を広げるための機能が満載です。
        </p>
      </div>
      
      {/* 機能カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 border hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-primary/10 w-fit">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
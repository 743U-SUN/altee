import React from 'react';
import { cn } from '@/lib/utils';

interface MainRightProps {
  className?: string;
}

export const MainRight: React.FC<MainRightProps> = ({
  className
}) => {
  return (
    <div className={cn(
      "w-full mx-auto",
      className
    )}>
      {/* 上部コンテンツエリア（ProfileCardに相当） - 高さ2000pxに設定 */}
      <div className="w-full mx-auto rounded-lg border bg-purple-100 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col items-center justify-start h-[2000px]">
          <p className="text-lg font-medium text-gray-600 sticky top-0 bg-purple-100 py-2">メインコンテンツ右エリア (高さ2000px)</p>
          <div className="mt-10 text-center">
            <p>スクロールテスト用の長いコンテンツエリア</p>
            <p className="mt-4">下にスクロールすると続きがあります</p>
          </div>
          <div className="mt-[900px] text-center">
            <p>コンテンツ中間部</p>
          </div>
          <div className="mt-[900px] text-center">
            <p>コンテンツ最下部</p>
          </div>
        </div>
      </div>
    </div>
  );
};
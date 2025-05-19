import React from 'react';
import { cn } from '@/lib/utils';

interface MainLeftProps {
  className?: string;
}

export const MainLeft: React.FC<MainLeftProps> = ({
  className
}) => {
  return (
    <div className={cn(
      "w-full mx-auto overflow-hidden flex flex-col h-full bg-green-100 rounded-lg",
      className
    )}>
      <div className="flex items-center justify-center h-full">
        <p className="text-lg font-medium text-gray-600">メインコンテンツ左エリア</p>
      </div>
    </div>
  );
};
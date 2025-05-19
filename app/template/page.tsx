import React from 'react';
import { MainLeft } from './components/MainLeft';
import { MainRight } from './components/MainRight';

export default function TemplatePage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="w-full lg:border-r lg:w-[400px] lg:sticky lg:top-0 lg:h-full lg:flex lg:flex-col">
        <MainLeft className="h-full" />
      </div>
      
      <div className="w-full pt-0 lg:pt-4 lg:flex-1 lg:overflow-y-auto pb-20 lg:pb-10 pr-0 lg:pr-4">
        <MainRight />
      </div>
    </div>
  );
}
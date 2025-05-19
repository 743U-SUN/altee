import React from 'react';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ExamplesSection } from './components/ExamplesSection';
import { CTASection } from './components/CTASection';

export default function TopPage() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* ヒーローセクション */}
      <HeroSection />
      
      {/* 主要機能セクション */}
      <FeaturesSection />
      
      {/* 事例・サンプルセクション */}
      <ExamplesSection />
      
      {/* コールトゥアクション */}
      <CTASection />
    </div>
  );
}
"use client";

import { Card } from "@/components/ui/card";
import SecondaryName from "./secondaryName";
import SecondaryDescription from "./secondaryDescription";
import SecondaryQuestions from "./secondaryQuestions";
import SecondaryLinks from "./secondaryLinks";
import SecondaryYoutube from "./secondaryYoutube";
import { UserProfileData } from "../types";

interface SecondaryProps {
  userData: UserProfileData;
}

export default function Secondary({ userData }: SecondaryProps) {
  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {/* 上部カード - 名前、説明、質問を含む */}
      <Card className="p-6 space-y-6">
        <SecondaryName 
          characterName={userData.characterName}
          subname={userData.subname}
        />
        
        {userData.bio && (
          <SecondaryDescription description={userData.bio} />
        )}
        
        {userData.customQuestions.length > 0 && (
          <SecondaryQuestions questions={userData.customQuestions} />
        )}
      </Card>

      {/* SNSリンク集 */}
      {userData.links.length > 0 && (
        <SecondaryLinks links={userData.links} />
      )}

      {/* YouTube動画 */}
      {userData.youtubeSettings && userData.youtubeSettings.videos.length > 0 && (
        <SecondaryYoutube 
          videos={userData.youtubeSettings.videos}
          displayCount={userData.youtubeSettings.displayCount}
          handle={userData.handle}
        />
      )}
    </div>
  );
}

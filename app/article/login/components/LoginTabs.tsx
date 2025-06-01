'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OAuthButtons from "./OAuthButtons";

export default function LoginTabs() {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">ログイン</TabsTrigger>
        <TabsTrigger value="signup">新規登録</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">アカウントにログイン</h2>
          <p className="text-sm text-muted-foreground">以下のサービスでログイン</p>
        </div>
        <OAuthButtons mode="login" />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">新規アカウント作成</h2>
          <p className="text-sm text-muted-foreground">以下のサービスで登録</p>
        </div>
        <OAuthButtons mode="signup" />
      </TabsContent>
    </Tabs>
  );
}
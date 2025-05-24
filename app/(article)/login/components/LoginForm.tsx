"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOAuthSignIn = async (provider: "google" | "discord") => {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="login">ログイン</TabsTrigger>
        <TabsTrigger value="signup">新規登録</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              お持ちのアカウントでログイン
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <Icons.google className="h-5 w-5" />
              Googleでログイン
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuthSignIn("discord")}
              disabled={isLoading}
            >
              <Icons.discord className="h-5 w-5" />
              Discordでログイン
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">新規登録</CardTitle>
            <CardDescription className="text-center">
              アカウントを作成して始めましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
            >
              <Icons.google className="h-5 w-5" />
              Googleで登録
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuthSignIn("discord")}
              disabled={isLoading}
            >
              <Icons.discord className="h-5 w-5" />
              Discordで登録
            </Button>
          </CardContent>
          <CardFooter className="text-xs text-center text-muted-foreground">
            登録すると、利用規約とプライバシーポリシーに同意したことになります。
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

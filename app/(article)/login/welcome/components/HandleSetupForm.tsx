"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateHandle, checkHandleAvailability } from "@/lib/validation/handleValidation";
import { HandleSetupForm, HandleUpdateResponse } from "@/lib/types/handle";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// Zodスキーマ（基本的なチェックのみ）
const handleSchema = z.object({
  handle: z.string()
    .min(1, "ハンドルを入力してください")
    .min(3, "ハンドルは3文字以上で入力してください")
    .max(20, "ハンドルは20文字以下で入力してください")
});

export default function HandleSetupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "unavailable" | "">("");
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | "">("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { update } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<HandleSetupForm>({
    resolver: zodResolver(handleSchema),
    mode: "onChange"
  });

  const currentHandle = watch("handle");

  // リアルタイム重複チェック
  const checkAvailability = async (handle: string) => {
    if (!handle || handle.trim().length < 3) {
      setAvailabilityMessage("");
      setAvailabilityStatus("");
      return;
    }

    const validation = validateHandle(handle);
    if (!validation.isValid) {
      setAvailabilityMessage(validation.message || "");
      setAvailabilityStatus("unavailable");
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkHandleAvailability(handle);
      // フロントエンドで既にチェック済みなので、APIからの重複エラーのみ表示
      if (result.isValid) {
        setAvailabilityMessage("使用可能です");
        setAvailabilityStatus("available");
      } else {
        // 重複エラーの場合のみAPIのメッセージを使用
        if (result.message?.includes("既に使用されています")) {
          setAvailabilityMessage(result.message);
        } else {
          setAvailabilityMessage("このハンドルは使用できません");
        }
        setAvailabilityStatus("unavailable");
      }
    } catch (error) {
      setAvailabilityMessage("確認中にエラーが発生しました");
      setAvailabilityStatus("unavailable");
    } finally {
      setIsChecking(false);
    }
  };

  // デバウンス用のtimeout管理
  // ハンドル入力時の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAvailabilityMessage("");
    setAvailabilityStatus("");
    
    // 前回のtimeoutをクリア
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // デバウンス処理
    const timeoutId = setTimeout(() => {
      if (value) {
        checkAvailability(value);
      }
    }, 500);
    
    setDebounceTimeout(timeoutId);
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // フォーム送信処理
  const onSubmit = async (data: HandleSetupForm) => {
    if (availabilityStatus !== "available") {
      setSubmitMessage("使用可能なハンドルを入力してください");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitStatus("");

    try {
      const response = await fetch("/api/user/handle/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: data.handle }),
      });

      const result: HandleUpdateResponse = await response.json();

      if (result.success) {
        setSubmitMessage("ハンドルが正常に設定されました！");
        setSubmitStatus("success");
        
        // セッションを更新
        await update();
        
        // 成功後、ユーザーページにリダイレクト
        setTimeout(() => {
          router.push("/user");
        }, 1500);
      } else {
        setSubmitMessage(result.message);
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitMessage("設定中にエラーが発生しました");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="handle">ハンドル</Label>
          <div className="relative">
            <Input
              id="handle"
              type="text"
              placeholder="your_handle"
              {...register("handle")}
              onChange={(e) => {
                register("handle").onChange(e);
                handleInputChange(e);
              }}
              className={`pr-10 ${
                availabilityStatus === "available" ? "border-green-500" : 
                availabilityStatus === "unavailable" ? "border-red-500" : ""
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!isChecking && availabilityStatus === "available" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {!isChecking && availabilityStatus === "unavailable" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          {errors.handle && (
            <p className="text-sm text-red-500">{errors.handle.message}</p>
          )}
          
          {availabilityMessage && (
            <p className={`text-sm ${
              availabilityStatus === "available" ? "text-green-600" : "text-red-500"
            }`}>
              {availabilityMessage}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            ハンドルはあなたの個人ページのURLに使用されます。3-20文字の英数字、アンダースコア、ハイフンが使用できます。
          </p>
        </div>

        {submitMessage && (
          <Alert variant={submitStatus === "error" ? "destructive" : "default"}>
            <AlertDescription>{submitMessage}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || availabilityStatus !== "available"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              設定中...
            </>
          ) : (
            "ハンドルを設定する"
          )}
        </Button>
      </form>
    </div>
  );
}

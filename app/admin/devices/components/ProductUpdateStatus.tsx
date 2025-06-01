"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UpdateStatistics {
  official: {
    total: number;
    updatedLastDay: number;
    updatedLastWeek: number;
    notUpdatedMonth: number;
  };
  custom: {
    total: number;
    updatedLastDay: number;
    updatedLastWeek: number;
    notUpdatedMonth: number;
  };
}

export function ProductUpdateStatus() {
  const [statistics, setStatistics] = useState<UpdateStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<any>(null);

  // 統計情報を取得
  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/admin/scheduled-update");
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 手動更新を実行
  const runManualUpdate = async () => {
    setIsUpdating(true);
    setUpdateResult(null);

    try {
      const response = await fetch("/api/admin/scheduled-update", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setUpdateResult(data.results);
        toast.success("商品情報の更新が完了しました");
        // 統計情報を再取得
        fetchStatistics();
      } else {
        toast.error("更新処理でエラーが発生しました");
      }
    } catch (error) {
      console.error("Error running update:", error);
      toast.error("更新処理でエラーが発生しました");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">読み込み中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  const officialPercentage = statistics.official.total > 0
    ? (statistics.official.updatedLastWeek / statistics.official.total) * 100
    : 0;

  const customPercentage = statistics.custom.total > 0
    ? (statistics.custom.updatedLastWeek / statistics.custom.total) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>商品情報の更新状況</CardTitle>
          <CardDescription>
            商品情報の自動更新状況と手動更新の実行
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 公式商品の統計 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">公式商品</h3>
              <Badge variant="outline">
                {statistics.official.total}件
              </Badge>
            </div>
            <Progress value={officialPercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">24時間以内</p>
                <p className="font-medium">{statistics.official.updatedLastDay}件</p>
              </div>
              <div>
                <p className="text-muted-foreground">1週間以内</p>
                <p className="font-medium">{statistics.official.updatedLastWeek}件</p>
              </div>
              <div>
                <p className="text-muted-foreground">1ヶ月以上未更新</p>
                <p className="font-medium text-destructive">
                  {statistics.official.notUpdatedMonth}件
                </p>
              </div>
            </div>
          </div>

          {/* カスタム商品の統計 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">カスタム商品</h3>
              <Badge variant="outline">
                {statistics.custom.total}件
              </Badge>
            </div>
            <Progress value={customPercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">24時間以内</p>
                <p className="font-medium">{statistics.custom.updatedLastDay}件</p>
              </div>
              <div>
                <p className="text-muted-foreground">1週間以内</p>
                <p className="font-medium">{statistics.custom.updatedLastWeek}件</p>
              </div>
              <div>
                <p className="text-muted-foreground">1ヶ月以上未更新</p>
                <p className="font-medium text-destructive">
                  {statistics.custom.notUpdatedMonth}件
                </p>
              </div>
            </div>
          </div>

          {/* 更新ボタン */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>定期更新は1週間ごとに実行されます</span>
            </div>
            <Button
              onClick={runManualUpdate}
              disabled={isUpdating}
              variant="outline"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  今すぐ更新
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 更新結果 */}
      {updateResult && (
        <Card>
          <CardHeader>
            <CardTitle>更新結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 公式商品の結果 */}
            <div>
              <h4 className="font-medium mb-2">公式商品</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>成功: {updateResult.official.success}件</span>
                </div>
                {updateResult.official.failed > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>失敗: {updateResult.official.failed}件</span>
                  </div>
                )}
              </div>
              {updateResult.official.errors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    <p className="font-medium">エラー詳細:</p>
                    <ul className="mt-1 text-sm">
                      {updateResult.official.errors.slice(0, 3).map((error: any, index: number) => (
                        <li key={index}>
                          ID {error.id}: {error.error}
                        </li>
                      ))}
                      {updateResult.official.errors.length > 3 && (
                        <li>...他 {updateResult.official.errors.length - 3}件</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* カスタム商品の結果 */}
            <div>
              <h4 className="font-medium mb-2">カスタム商品</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>成功: {updateResult.custom.success}件</span>
                </div>
                {updateResult.custom.failed > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>失敗: {updateResult.custom.failed}件</span>
                  </div>
                )}
              </div>
              {updateResult.custom.errors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    <p className="font-medium">エラー詳細:</p>
                    <ul className="mt-1 text-sm">
                      {updateResult.custom.errors.slice(0, 3).map((error: any, index: number) => (
                        <li key={index}>
                          ID {error.id}: {error.error}
                        </li>
                      ))}
                      {updateResult.custom.errors.length > 3 && (
                        <li>...他 {updateResult.custom.errors.length - 3}件</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
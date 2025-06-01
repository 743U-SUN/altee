'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importProductsFromCSV } from '@/lib/actions/admin-product-actions';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CSVImportDialog({ open, onOpenChange }: CSVImportDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: 'エラー',
        description: 'CSVファイルを選択してください',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(20);

    try {
      // ファイルを読み込む
      const content = await file.text();
      setProgress(50);

      // インポート実行
      const result = await importProductsFromCSV(content);
      setProgress(100);

      if (result.success) {
        setResult(result);
        toast({
          title: '成功',
          description: result.message,
        });
        
        // 成功した場合は画面をリフレッシュ
        if (result.created && result.created > 0) {
          setTimeout(() => {
            router.refresh();
            onOpenChange(false);
          }, 2000);
        }
      } else {
        setResult(result);
        toast({
          title: 'エラー',
          description: result.message || 'インポートに失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ファイルの処理中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>商品一括インポート</DialogTitle>
          <DialogDescription>
            CSVファイルをアップロードして、複数の商品を一括で登録できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ファイル選択 */}
          {!result && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      CSVファイルを選択またはドラッグ＆ドロップ
                    </span>
                    <input
                      id="csv-upload"
                      name="csv-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileSelect}
                      disabled={importing}
                    />
                  </label>
                </div>
                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  CSVファイルの形式は、エクスポート機能で出力されるファイルを参考にしてください。
                  ASINが重複する商品はスキップされます。
                </AlertDescription>
              </Alert>

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    インポート中...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 結果表示 */}
          {result && (
            <div className="space-y-4">
              {result.success && result.created > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">エラー詳細:</h4>
                  <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                    {result.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">行 {error.row}:</span>{' '}
                        <span className="text-destructive">{error.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={importing}
            >
              {result?.success && result.created > 0 ? '閉じる' : 'キャンセル'}
            </Button>
            {!result && (
              <Button
                onClick={handleImport}
                disabled={!file || importing}
              >
                インポート
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
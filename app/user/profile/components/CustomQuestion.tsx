'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, GripVertical, Info, Trash2, Save, MessageCircleQuestion, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { questionSchema, answerSchema } from '@/lib/validation/schemas';
import { 
  getUserCustomQuestions, 
  createCustomQuestion, 
  updateCustomQuestion, 
  deleteCustomQuestion, 
  reorderCustomQuestions 
} from '@/lib/actions/qa-actions';

interface CustomQuestionItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface CustomQuestionProps {
  userId: string;
}

export function CustomQuestion({ userId }: CustomQuestionProps) {
  const [questions, setQuestions] = useState<CustomQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [tempQuestions, setTempQuestions] = useState<{ [key: string]: string }>({});
  const [tempAnswers, setTempAnswers] = useState<{ [key: string]: string }>({});

  // Q&Aデータを取得
  const fetchQuestions = async () => {
    try {
      const result = await getUserCustomQuestions();
      
      if (result.success) {
        setQuestions(result.data || []);
        
        // 入力欄の初期値を設定
        const tempQ: { [key: string]: string } = {};
        const tempA: { [key: string]: string } = {};
        (result.data || []).forEach((item: CustomQuestionItem) => {
          tempQ[item.id] = item.question;
          tempA[item.id] = item.answer;
        });
        setTempQuestions(tempQ);
        setTempAnswers(tempA);
      } else {
        console.error('Question fetch error:', result.error);
        toast.error(result.error || 'Q&Aの取得に失敗しました');
      }
    } catch (error) {
      console.error('Question fetch error:', error);
      toast.error('Q&Aの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [userId]);

  // 新しいQ&Aを追加
  const handleAddQuestion = async () => {
    try {
      setIsAdding(true);
      
      const result = await createCustomQuestion({
        question: '',
        answer: ''
      });

      if (result.success) {
        // 新しいQ&Aを追加
        const newQuestion: CustomQuestionItem = {
          id: result.data.id,
          question: '',
          answer: '',
          sortOrder: result.data.sortOrder
        };
        
        setQuestions(prev => [...prev, newQuestion]);
        setTempQuestions(prev => ({ ...prev, [result.data.id]: '' }));
        setTempAnswers(prev => ({ ...prev, [result.data.id]: '' }));
        
        toast.success('Q&Aを追加しました');
      } else {
        toast.error(result.error || 'Q&Aの追加に失敗しました');
      }
    } catch (error) {
      console.error('Add question error:', error);
      toast.error('Q&Aの追加に失敗しました');
    } finally {
      setIsAdding(false);
    }
  };

  // Q&Aを削除
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setIsDeletingId(questionId);
      
      const result = await deleteCustomQuestion(questionId);

      if (result.success) {
        // Q&Aを削除して並び順を更新
        setQuestions(prev => {
          const filtered = prev.filter(item => item.id !== questionId);
          return filtered.map((item, index) => ({
            ...item,
            sortOrder: index
          }));
        });
        
        // 一時データも削除
        setTempQuestions(prev => {
          const newQuestions = { ...prev };
          delete newQuestions[questionId];
          return newQuestions;
        });
        setTempAnswers(prev => {
          const newAnswers = { ...prev };
          delete newAnswers[questionId];
          return newAnswers;
        });
        
        toast.success('Q&Aを削除しました');
      } else {
        toast.error(result.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Q&Aデータを保存
  const handleSaveData = async (questionId: string) => {
    const question = tempQuestions[questionId]?.trim() || '';
    const answer = tempAnswers[questionId]?.trim() || '';

    // 新しいスキーマでバリデーション
    try {
      questionSchema.parse(question);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || '質問の入力内容に問題があります';
      toast.error(errorMessage);
      return;
    }

    try {
      answerSchema.parse(answer);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || '回答の入力内容に問題があります';
      toast.error(errorMessage);
      return;
    }

    try {
      setIsSavingId(questionId);
      
      const result = await updateCustomQuestion(questionId, {
        question,
        answer
      });

      if (result.success) {
        // ローカルのデータを更新
        setQuestions(prev =>
          prev.map(item =>
            item.id === questionId ? { 
              ...item, 
              question,
              answer
            } : item
          )
        );

        toast.success('保存しました');
      } else {
        toast.error(result.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsSavingId(null);
    }
  };

  // ドラッグ&ドロップで並び替え
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newQuestions = [...questions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(dropIndex, 0, draggedItem);

    // 並び順を更新
    const updatedQuestions = newQuestions.map((item, index) => ({
      ...item,
      sortOrder: index
    }));

    setQuestions(updatedQuestions);
    setDraggedIndex(null);

    // APIで並び順を更新
    try {
      const result = await reorderCustomQuestions(
        updatedQuestions.map(item => ({
          id: item.id,
          sortOrder: item.sortOrder
        }))
      );

      if (result.success) {
        toast.success('並び順を更新しました');
      } else {
        toast.error(result.error || '並び順の更新に失敗しました');
        // エラー時は元に戻す
        fetchQuestions();
      }
    } catch (error) {
      console.error('Sort update error:', error);
      toast.error('並び順の更新に失敗しました');
      // エラー時は元に戻す
      fetchQuestions();
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4">
        <p className="text-gray-600">
          プロフィールに表示するQ&Aを設定します。よくある質問や自己紹介に活用してください。
        </p>
        <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 質問は最大20文字、回答は最大50文字まで入力できます</p>
            <p>• 日本語文字、英数字、記号（: , " / ? ! @ # $ % & * ( ) + = [ ] { } | \ ` ~ など）が使用可能です</p>
            <p>• ドラッグ&ドロップで並び順を変更できます</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Q&A一覧 */}
        <div className="space-y-4">
          {questions.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg border ${
                draggedIndex === index ? 'opacity-50 border-primary' : 'border-gray-200'
              } p-4 cursor-move`}
            >
              <div className="flex gap-4">
                {/* ドラッグハンドルと順番 */}
                <div className="flex items-start gap-2">
                  <div className="pt-8">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="pt-6">
                    <div className="w-8 h-8 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* 入力欄と操作ボタン */}
                <div className="flex-1 space-y-3">
                  {/* 質問入力 */}
                  <div>
                    <Label htmlFor={`question-${item.id}`} className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <MessageCircleQuestion className="h-3.5 w-3.5" />
                      質問（最大20文字）
                    </Label>
                    <Input
                      id={`question-${item.id}`}
                      type="text"
                      placeholder="例：趣味は何ですか？"
                      value={tempQuestions[item.id] || ''}
                      onChange={(e) => setTempQuestions(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {tempQuestions[item.id]?.length || 0}/20文字
                    </p>
                  </div>

                  {/* 回答入力 */}
                  <div>
                    <Label htmlFor={`answer-${item.id}`} className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      回答（最大50文字）
                    </Label>
                    <Textarea
                      id={`answer-${item.id}`}
                      placeholder="例：プログラミングと映画鑑賞です。"
                      value={tempAnswers[item.id] || ''}
                      onChange={(e) => setTempAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full resize-none"
                      rows={2}
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {tempAnswers[item.id]?.length || 0}/50文字
                    </p>
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      onClick={() => handleSaveData(item.id)}
                      disabled={isSavingId === item.id}
                    >
                      {isSavingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          保存
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(item.id)}
                      disabled={isDeletingId === item.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          削除
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Q&A追加ボタン */}
          <div className="flex justify-center">
            <Button
              onClick={handleAddQuestion}
              disabled={isAdding}
              variant="outline"
              className="w-full max-w-md"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              新しいQ&Aを追加
            </Button>
          </div>
        </div>

        {/* 説明テキスト */}
        <div className="space-y-2 text-sm text-gray-500">
          <p>• 質問は20文字以内、回答は50文字以内で入力してください</p>
          <p>• 日本語文字、英数字、記号（: , " / ? ! @ # $ % & * ( ) + = [ ] { } | \ ` ~ など）が使用可能です</p>
          <p>• プロフィールページで訪問者に表示されます</p>
          <p>• 並び順はドラッグ&ドロップで自由に変更できます</p>
        </div>
      </div>
    </div>
  );
}
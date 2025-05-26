'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Loader2, Trash2, Save, MessageCircleQuestion, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { InfoCategoryWithQuestions, InfoQuestion } from '../types';

interface InfoQuestionCardProps {
  category: InfoCategoryWithQuestions;
  userId: string;
  onUpdateQuestions: (questions: InfoQuestion[]) => void;
}

export function InfoQuestionCard({ category, userId, onUpdateQuestions }: InfoQuestionCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [tempQuestions, setTempQuestions] = useState<{ [key: string]: string }>({});
  const [tempAnswers, setTempAnswers] = useState<{ [key: string]: string }>({});

  // カテゴリの質問が変更されたときに一時データを初期化（1回のみ）
  useEffect(() => {
    const tempQ: { [key: string]: string } = {};
    const tempA: { [key: string]: string } = {};
    
    category.questions.forEach(q => {
      // 既存のデータがない場合のみ初期化
      if (!tempQuestions[q.id]) {
        tempQ[q.id] = q.question;
      }
      if (!tempAnswers[q.id]) {
        tempA[q.id] = q.answer;
      }
    });
    
    // 新しいQ&Aがある場合のみ更新
    if (Object.keys(tempQ).length > 0) {
      setTempQuestions(prev => ({ ...prev, ...tempQ }));
    }
    if (Object.keys(tempA).length > 0) {
      setTempAnswers(prev => ({ ...prev, ...tempA }));
    }
  }, [category.questions.length]); // lengthの変更のみを監視

  // 新しいQ&Aを追加
  const handleAddQuestion = async () => {
    try {
      setIsAdding(true);
      
      const response = await fetch('/api/user/info-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: category.id,
          question: '',
          answer: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Q&Aの追加に失敗しました');
      }

      const result = await response.json();
      
      // 新しいQ&Aを追加
      const newQuestions = [...category.questions, result.question];
      onUpdateQuestions(newQuestions);
      
      toast.success('Q&Aを追加しました');
    } catch (error) {
      console.error('Add question error:', error);
      toast.error(error instanceof Error ? error.message : 'Q&Aの追加に失敗しました');
    } finally {
      setIsAdding(false);
    }
  };

  // Q&Aを削除
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setIsDeletingId(questionId);
      
      const response = await fetch('/api/user/info-questions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '削除に失敗しました');
      }

      // Q&Aを削除
      const filtered = category.questions.filter(item => item.id !== questionId);
      onUpdateQuestions(filtered);
      
      toast.success('Q&Aを削除しました');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Q&Aデータを保存
  const handleSaveData = async (questionId: string) => {
    const question = tempQuestions[questionId]?.trim();
    const answer = tempAnswers[questionId]?.trim();

    // バリデーション
    if (!question) {
      toast.error('質問を入力してください');
      return;
    }
    if (!answer) {
      toast.error('回答を入力してください');
      return;
    }
    if (question.length > 30) {
      toast.error('質問は30文字以内で入力してください');
      return;
    }
    if (answer.length > 1000) {
      toast.error('回答は1000文字以内で入力してください');
      return;
    }

    try {
      setIsSavingId(questionId);
      
      const response = await fetch('/api/user/info-questions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          question,
          answer
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      // ローカルのデータを更新
      const updatedQuestions = category.questions.map(item =>
        item.id === questionId ? { 
          ...item, 
          question,
          answer
        } : item
      );
      
      onUpdateQuestions(updatedQuestions);

      toast.success('保存しました');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : '保存に失敗しました');
    } finally {
      setIsSavingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Q&A一覧 */}
      <Accordion type="single" collapsible className="w-full space-y-3 border-b-1">
        {category.questions.map((item, index) => (
          <AccordionItem key={item.id} value={item.id} className="border border-gray-200 border-x-0">
            <div className="relative">
              <AccordionTrigger className="hover:no-underline w-full px-4 py-4 pr-24 [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center space-x-2 text-left min-w-0 flex-1">
                  <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {tempQuestions[item.id] || item.question || `質問 ${index + 1}`}
                  </span>
                </div>
              </AccordionTrigger>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 z-10">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveData(item.id);
                  }}
                  disabled={isSavingId === item.id}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  {isSavingId === item.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(item.id);
                  }}
                  disabled={isDeletingId === item.id}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  {isDeletingId === item.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`question-${item.id}`} className="text-xs font-medium text-gray-700">
                    質問 (30文字以内)
                  </Label>
                  <Input
                    id={`question-${item.id}`}
                    value={tempQuestions[item.id] || ''}
                    onChange={(e) => setTempQuestions(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="質問を入力してください"
                    maxLength={30}
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(tempQuestions[item.id] || '').length}/30文字
                  </div>
                </div>
                <div>
                  <Label htmlFor={`answer-${item.id}`} className="text-xs font-medium text-gray-700">
                    回答 (1000文字以内)
                  </Label>
                  <Textarea
                    id={`answer-${item.id}`}
                    value={tempAnswers[item.id] || ''}
                    onChange={(e) => setTempAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="回答を入力してください"
                    maxLength={1000}
                    rows={4}
                    className="mt-1 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(tempAnswers[item.id] || '').length}/1000文字
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
        
      {/* Q&A追加ボタン */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleAddQuestion}
          disabled={isAdding}
          variant="outline"
          size="sm"
          className="w-full max-w-xs h-8 text-xs"
        >
          {isAdding ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-3 w-3 mr-1.5" />
          )}
          Q&Aを追加
        </Button>
      </div>

      {category.questions.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <MessageCircleQuestion className="h-6 w-6 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">まだQ&Aがありません</p>
          <p className="text-xs text-gray-400">上のボタンからQ&Aを追加し、クリックして編集してください</p>
        </div>
      )}
    </div>
  );
}

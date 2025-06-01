'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Loader2, Trash2, Save, MessageCircleQuestion, MessageSquare, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { InfoCategoryWithQuestions, InfoQuestion } from '../types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface InfoQuestionCardProps {
  category: InfoCategoryWithQuestions;
  userId: string;
  onUpdateQuestions: (questions: InfoQuestion[]) => void;
}

// SortableQuestionItem コンポーネントのProps定義
interface SortableQuestionItemProps {
  question: InfoQuestion;
  index: number;
  tempQuestions: { [key: string]: string };
  tempAnswers: { [key: string]: string };
  isDeletingId: string | null;
  isSavingId: string | null;
  setTempQuestions: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setTempAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSaveData: (questionId: string) => Promise<void>;
  handleDeleteQuestion: (questionId: string) => Promise<void>;
}

// SortableQuestionItemコンポーネント
function SortableQuestionItem({ 
  question, 
  index, 
  tempQuestions,
  tempAnswers,
  isDeletingId,
  isSavingId,
  setTempQuestions,
  setTempAnswers,
  handleSaveData,
  handleDeleteQuestion
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 border-x-0 border-b-0 hover:bg-gray-50 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <AccordionItem
        key={question.id}
        value={question.id}
        className="border-0"
      >
      <div className="relative flex items-stretch">
        {/* ドラッグハンドル */}
        <div className="flex items-center px-2 text-gray-400">
          <GripVertical className="h-4 w-4" />
        </div>
        
        {/* アコーディオントリガー */}
        <div className="flex-1">
          <AccordionTrigger 
            className="hover:no-underline w-full px-4 py-4 pr-24 [&[data-state=open]>svg]:rotate-180"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="flex items-center space-x-2 text-left min-w-0 flex-1">
              <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                {tempQuestions[question.id] || question.question || `質問 ${index + 1}`}
              </span>
            </div>
          </AccordionTrigger>
        </div>
        
        {/* 操作ボタン */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 z-10">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveData(question.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isSavingId === question.id}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
          >
            {isSavingId === question.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion(question.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isDeletingId === question.id}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
          >
            {isDeletingId === question.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      
        <AccordionContent 
          className="px-4 pb-4 ml-10"
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
        <div className="space-y-4">
          <div>
            <Label htmlFor={`question-${question.id}`} className="text-xs font-medium text-gray-700">
              質問 (30文字以内)
            </Label>
            <Input
              id={`question-${question.id}`}
              value={tempQuestions[question.id] || ''}
              onChange={(e) => setTempQuestions(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="質問を入力してください"
              maxLength={30}
              className="mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">
              {(tempQuestions[question.id] || '').length}/30文字
            </div>
          </div>
          <div>
            <Label htmlFor={`answer-${question.id}`} className="text-xs font-medium text-gray-700">
              回答 (1000文字以内)
            </Label>
            <Textarea
              id={`answer-${question.id}`}
              value={tempAnswers[question.id] || ''}
              onChange={(e) => setTempAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="回答を入力してください"
              maxLength={1000}
              rows={4}
              className="mt-1 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {(tempAnswers[question.id] || '').length}/1000文字
            </div>
          </div>
          </div>
        </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export function InfoQuestionCard({ category, userId, onUpdateQuestions }: InfoQuestionCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [tempQuestions, setTempQuestions] = useState<{ [key: string]: string }>({});
  const [tempAnswers, setTempAnswers] = useState<{ [key: string]: string }>({});

  // ドラッグアンドドロップ用センサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動でドラッグ開始
      },
    })
  );

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

  // ドラッグ終了時の処理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = category.questions.findIndex(q => q.id === active.id);
    const newIndex = category.questions.findIndex(q => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 配列を並べ替え
    const newQuestions = arrayMove(category.questions, oldIndex, newIndex);
    
    // sortOrderを更新
    const updatedQuestions = newQuestions.map((item, index) => ({
      ...item,
      sortOrder: index
    }));

    // ローカル状態を即座に更新
    onUpdateQuestions(updatedQuestions);

    // API更新
    try {
      const response = await fetch('/api/user/info-questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          questions: updatedQuestions.map(item => ({
            id: item.id,
            sortOrder: item.sortOrder
          }))
        }),
      });

      if (!response.ok) throw new Error('並び順の更新に失敗しました');
      toast.success('Q&Aの並び順を更新しました');
    } catch (error) {
      console.error('Sort update error:', error);
      toast.error('並び順の更新に失敗しました');
      // エラー時は元に戻す
      onUpdateQuestions(category.questions);
    }
  };

  // sortOrderでソートされたQ&Aリストを取得
  const sortedQuestions = [...category.questions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-3">
      {/* Q&A一覧 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedQuestions.map(q => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion type="single" collapsible className="w-full space-y-0 border-b-1">
            {sortedQuestions.map((item, index) => (
              <SortableQuestionItem
                key={item.id}
                question={item}
                index={index}
                tempQuestions={tempQuestions}
                tempAnswers={tempAnswers}
                isDeletingId={isDeletingId}
                isSavingId={isSavingId}
                setTempQuestions={setTempQuestions}
                setTempAnswers={setTempAnswers}
                handleSaveData={handleSaveData}
                handleDeleteQuestion={handleDeleteQuestion}
              />
            ))}
          </Accordion>
        </SortableContext>
      </DndContext>
        
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

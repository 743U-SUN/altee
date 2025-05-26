'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Loader2, GripVertical, Trash2, Save, Edit3, Folder, Info, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { InfoCategoryWithQuestions } from '../types';
import { InfoQuestionCard } from './InfoQuestionCard';
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

interface InfoCategoryManagerProps {
  userId: string;
}

// SortableItem コンポーネントのProps定義
interface SortableItemProps {
  category: InfoCategoryWithQuestions;
  index: number;
  editingId: string | null;
  tempNames: { [key: string]: string };
  isDeletingId: string | null;
  isSavingId: string | null;
  setEditingId: (id: string | null) => void;
  setTempNames: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSaveCategoryName: (categoryId: string) => Promise<void>;
  handleDeleteCategory: (categoryId: string) => Promise<void>;
  handleUpdateCategoryQuestions: (categoryId: string, updatedQuestions: any[]) => void;
  userId: string;
}

// SortableItemコンポーネントを関数の外に移動
function SortableItem({ 
  category, 
  index, 
  editingId,
  tempNames,
  isDeletingId,
  isSavingId,
  setEditingId,
  setTempNames,
  handleSaveCategoryName,
  handleDeleteCategory,
  handleUpdateCategoryQuestions,
  userId
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border ${
        isDragging ? 'border-primary' : 'border-gray-200'
      } p-2 md:p-6 cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      {/* カテゴリヘッダー */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <div className="w-8 h-8 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center justify-center">
            {index + 1}
          </div>
        </div>

        <div className="flex-1">

          {editingId === category.id ? (
            <div 
              className="flex gap-2 items-center"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Input
                value={tempNames[category.id] || ''}
                onChange={(e) => setTempNames(prev => ({ ...prev, [category.id]: e.target.value }))}
                placeholder="例：イラスト依頼について"
                className="flex-1"
                maxLength={30}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCategoryName(category.id);
                  } else if (e.key === 'Escape') {
                    setTempNames(prev => ({ ...prev, [category.id]: category.name }));
                    setEditingId(null);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => handleSaveCategoryName(category.id)}
                disabled={isSavingId === category.id}
              >
                {isSavingId === category.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(category.id)}
                className="h-6 w-6 p-0"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteCategory(category.id)}
          disabled={isDeletingId === category.id}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isDeletingId === category.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Q&A管理アコーディオン */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="cursor-default"
      >
        <Accordion 
          type="single" 
          collapsible 
          className="w-full border border-gray-200 rounded-sm px-0 py-2 pr-2"
        >
          <AccordionItem value="questions" className="border-0">
            <AccordionTrigger className="hover:no-underline py-2 px-0">
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm font-medium text-gray-700">
                  Q&A管理 ({category.questions.length}個)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0">
              <InfoQuestionCard
                category={category}
                userId={userId}
                onUpdateQuestions={(updatedQuestions) => 
                  handleUpdateCategoryQuestions(category.id, updatedQuestions)
                }
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export function InfoCategoryManager({ userId }: InfoCategoryManagerProps) {
  const [categories, setCategories] = useState<InfoCategoryWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNames, setTempNames] = useState<{ [key: string]: string }>({});


  // センサー設定（タッチ・マウス対応のみ、キーボード操作は無効化）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動でドラッグ開始
      },
    })
    // KeyboardSensorを削除（文字入力との干渉を防ぐため）
  );

  // カテゴリデータを取得
  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/user/info-categories?userId=${userId}`);
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました');
      
      const data = await response.json();
      setCategories(data.categories || []);
      
      // 編集用の初期値を設定
      const tempN: { [key: string]: string } = {};
      (data.categories || []).forEach((category: InfoCategoryWithQuestions) => {
        tempN[category.id] = category.name;
      });
      setTempNames(tempN);
    } catch (error) {
      console.error('Category fetch error:', error);
      toast.error('カテゴリの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  // 新しいカテゴリを追加
  const handleAddCategory = async () => {
    if (categories.length >= 5) {
      toast.error('カテゴリは最大5個まで作成できます');
      return;
    }

    try {
      setIsAdding(true);
      
      const response = await fetch('/api/user/info-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: `カテゴリ ${categories.length + 1}`,
          sortOrder: categories.length
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カテゴリの追加に失敗しました');
      }

      const result = await response.json();
      
      // 新しいカテゴリを追加
      const newCategory: InfoCategoryWithQuestions = {
        ...result.category,
        questions: []
      };
      
      setCategories(prev => [...prev, newCategory]);
      setTempNames(prev => ({ ...prev, [result.category.id]: result.category.name }));
      setEditingId(result.category.id); // 追加後すぐに編集モードに
      

      
      toast.success('カテゴリを追加しました');
    } catch (error) {
      console.error('Add category error:', error);
      toast.error(error instanceof Error ? error.message : 'カテゴリの追加に失敗しました');
    } finally {
      setIsAdding(false);
    }
  };

  // カテゴリを削除
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsDeletingId(categoryId);
      
      const response = await fetch('/api/user/info-categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, categoryId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '削除に失敗しました');
      }

      const result = await response.json();

      // カテゴリを削除して並び順を更新
      setCategories(prev => {
        const filtered = prev.filter(item => item.id !== categoryId);
        return filtered.map((item, index) => ({
          ...item,
          sortOrder: index
        }));
      });
      
      // 一時データも削除
      setTempNames(prev => {
        const newNames = { ...prev };
        delete newNames[categoryId];
        return newNames;
      });
      


      if (editingId === categoryId) {
        setEditingId(null);
      }
      
      toast.success(`カテゴリを削除しました${result.deletedQuestionsCount > 0 ? `（${result.deletedQuestionsCount}個のQ&Aも削除されました）` : ''}`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setIsDeletingId(null);
    }
  };

  // カテゴリ名を保存
  const handleSaveCategoryName = async (categoryId: string) => {
    const name = tempNames[categoryId]?.trim();

    // バリデーション
    if (!name) {
      toast.error('カテゴリ名を入力してください');
      return;
    }
    if (name.length > 30) {
      toast.error('カテゴリ名は30文字以内で入力してください');
      return;
    }

    // 重複チェック
    const isDuplicate = categories.some(cat => 
      cat.id !== categoryId && cat.name === name
    );
    if (isDuplicate) {
      toast.error('同名のカテゴリが既に存在します');
      return;
    }

    try {
      setIsSavingId(categoryId);
      
      const response = await fetch('/api/user/info-categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          categoryId,
          name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      // ローカルのデータを更新
      setCategories(prev =>
        prev.map(item =>
          item.id === categoryId ? { 
            ...item, 
            name
          } : item
        )
      );

      setEditingId(null);
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

    const oldIndex = categories.findIndex(cat => cat.id === active.id);
    const newIndex = categories.findIndex(cat => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 配列を並べ替え
    const newCategories = arrayMove(categories, oldIndex, newIndex);
    
    // sortOrderを更新
    const updatedCategories = newCategories.map((item, index) => ({
      ...item,
      sortOrder: index
    }));

    setCategories(updatedCategories);

    // API更新
    try {
      const response = await fetch('/api/user/info-categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          categories: updatedCategories.map(item => ({
            id: item.id,
            sortOrder: item.sortOrder
          }))
        }),
      });

      if (!response.ok) throw new Error('並び順の更新に失敗しました');
      toast.success('並び順を更新しました');
    } catch (error) {
      console.error('Sort update error:', error);
      toast.error('並び順の更新に失敗しました');
      fetchCategories(); // エラー時は元に戻す
    }
  };

  // カテゴリのQ&Aを更新
  const handleUpdateCategoryQuestions = (categoryId: string, updatedQuestions: any[]) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, questions: updatedQuestions }
          : category
      )
    );
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
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          ユーザーページに表示するインフォメーションを設定します。大カテゴリを作成して、その中にQ&Aを追加できます。
        </p>
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p>• カテゴリは最大5個まで作成できます</p>
            <p>• カテゴリ名は最大30文字まで入力できます</p>
            <p>• 「Q&A管理」アコーディオンでQ&Aを管理できます</p>
            <p>• Q&Aがないカテゴリは表示されません</p>
            <p>• ドラッグ&ドロップで並び順を変更できます</p>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {categories.map((category, index) => (
              <SortableItem
                key={category.id}
                category={category}
                index={index}
                editingId={editingId}
                tempNames={tempNames}
                isDeletingId={isDeletingId}
                isSavingId={isSavingId}
                setEditingId={setEditingId}
                setTempNames={setTempNames}
                handleSaveCategoryName={handleSaveCategoryName}
                handleDeleteCategory={handleDeleteCategory}
                handleUpdateCategoryQuestions={handleUpdateCategoryQuestions}
                userId={userId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* カテゴリ追加ボタン */}
      <div className="flex justify-center">
        <Button
          onClick={handleAddCategory}
          disabled={isAdding || categories.length >= 5}
          variant="outline"
          className="w-full max-w-md"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          新しいカテゴリを追加 {categories.length >= 5 && '（上限に達しました）'}
        </Button>
      </div>

      {/* 説明テキスト */}
      <div className="space-y-2 text-sm text-gray-500">
        <p>• カテゴリは最大5個まで作成できます</p>
        <p>• Q&Aがないカテゴリはユーザーページに表示されません</p>
        <p>• 「Q&A管理」をクリックしてQ&Aの追加・編集ができます</p>
        <p>• 並び順はドラッグ&ドロップで自由に変更できます</p>
      </div>
    </div>
  );
}
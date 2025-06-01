'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
}

interface CategorySelectorProps {
  selected: string[];
  onChange: (value: string[]) => void;
}

export default function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // カテゴリ一覧の取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('カテゴリの取得に失敗しました');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('カテゴリ取得エラー:', error);
        toast.error('カテゴリの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 選択状態の切り替え
  const toggleCategory = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter(id => id !== categoryId));
    } else {
      onChange([...selected, categoryId]);
    }
  };
  
  // 新規カテゴリの作成
  const handleCreateCategory = async () => {
    try {
      setSubmitting(true);
      
      if (!newCategoryName.trim()) {
        toast.error('カテゴリ名を入力してください');
        return;
      }
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCategoryName.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('カテゴリの作成に失敗しました');
      }
      
      const newCategory = await response.json();
      
      setCategories([...categories, newCategory]);
      onChange([...selected, newCategory.id]);
      setNewCategoryName('');
      setShowNew(false);
      toast.success('カテゴリを作成しました');
    } catch (error) {
      console.error('カテゴリ作成エラー:', error);
      toast.error('カテゴリの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 検索結果によるフィルタリング
  const filteredCategories = categories.filter(
    category => category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 選択されたカテゴリ情報
  const selectedCategories = categories.filter(cat => selected.includes(cat.id));
  
  return (
    <div className="space-y-4">
      {/* 選択済みカテゴリ表示 */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCategories.length > 0 ? (
          selectedCategories.map(category => (
            <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
              {category.name}
              <button 
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-background/50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">カテゴリが選択されていません</span>
        )}
      </div>
      
      {/* 検索入力 */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="カテゴリを検索"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* カテゴリ一覧 */}
      <div className="max-h-48 overflow-y-auto border rounded-md p-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">読み込み中...</span>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="space-y-2">
            {filteredCategories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selected.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2 text-center text-sm text-muted-foreground">
            {searchTerm ? '一致するカテゴリがありません' : 'カテゴリがありません'}
          </div>
        )}
      </div>
      
      {/* 新規カテゴリ作成 */}
      {showNew ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="新しいカテゴリ名"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={submitting}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleCreateCategory}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowNew(false)}
            disabled={submitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowNew(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          新しいカテゴリを追加
        </Button>
      )}
    </div>
  );
}
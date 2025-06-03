'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTagsAction, createTagAction } from '@/lib/actions/article-actions';
import slugify from 'slugify';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TagSelectorProps {
  selected: string[];
  onChange: (value: string[]) => void;
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // タグ一覧の取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const result = await getTagsAction();
        if (result.success && result.data) {
          setTags(result.data);
        } else {
          throw new Error(result.error || 'タグの取得に失敗しました');
        }
      } catch (error) {
        console.error('タグ取得エラー:', error);
        toast.error('タグの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTags();
  }, []);
  
  // 選択状態の切り替え
  const toggleTag = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter(id => id !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };
  
  // 新規タグの作成
  const handleCreateTag = async () => {
    try {
      setSubmitting(true);
      
      if (!newTagName.trim()) {
        toast.error('タグ名を入力してください');
        return;
      }
      
      const tagData = {
        name: newTagName.trim(),
        slug: slugify(newTagName.trim(), { lower: true, strict: true }),
        description: ''
      };
      
      const result = await createTagAction(tagData);
      
      if (result.success && result.data) {
        setTags([...tags, result.data]);
        onChange([...selected, result.data.id]);
        setNewTagName('');
        setShowNew(false);
        toast.success('タグを作成しました');
      } else {
        throw new Error(result.error || 'タグの作成に失敗しました');
      }
    } catch (error) {
      console.error('タグ作成エラー:', error);
      toast.error('タグの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 検索結果によるフィルタリング
  const filteredTags = tags.filter(
    tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 選択されたタグ情報
  const selectedTags = tags.filter(tag => selected.includes(tag.id));
  
  return (
    <div className="space-y-4">
      {/* 選択済みタグ表示 */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.length > 0 ? (
          selectedTags.map(tag => (
            <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
              {tag.name}
              <button 
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-background/50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">タグが選択されていません</span>
        )}
      </div>
      
      {/* 検索入力 */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="タグを検索"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* タグ一覧 */}
      <div className="max-h-48 overflow-y-auto border rounded-md p-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">読み込み中...</span>
          </div>
        ) : filteredTags.length > 0 ? (
          <div className="space-y-2">
            {filteredTags.map(tag => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selected.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                />
                <label
                  htmlFor={`tag-${tag.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2 text-center text-sm text-muted-foreground">
            {searchTerm ? '一致するタグがありません' : 'タグがありません'}
          </div>
        )}
      </div>
      
      {/* 新規タグ作成 */}
      {showNew ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="新しいタグ名"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={submitting}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleCreateTag}
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
          新しいタグを追加
        </Button>
      )}
    </div>
  );
}
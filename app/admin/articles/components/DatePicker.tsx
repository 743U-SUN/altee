'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export default function DatePicker({ 
  date, 
  setDate, 
  className,
  placeholder = '日付を選択'
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'yyyy年MM月dd日', { locale: ja }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={ja}
          // 時間を保持するために、新しい日付を選択する際に時間を引き継ぐ
          onDayClick={(day, modifiers) => {
            if (modifiers.selected && date) {
              // 既に選択されている日付をクリックした場合、選択を解除
              setDate(undefined);
            } else if (!modifiers.disabled && date) {
              // 既存の日付から時間を引き継ぐ
              const newDate = new Date(day);
              newDate.setHours(date.getHours());
              newDate.setMinutes(date.getMinutes());
              setDate(newDate);
            }
          }}
        />
        {date && (
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <input
                type="time"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={date ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : ''}
                onChange={(e) => {
                  if (date) {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(date);
                    newDate.setHours(hours || 0);
                    newDate.setMinutes(minutes || 0);
                    setDate(newDate);
                  }
                }}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
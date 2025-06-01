'use client';

import { useState, useEffect } from 'react';
import { SeriesManager } from '../components/SeriesManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SeriesPage() {
  const [manufacturers, setManufacturers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/api/admin/manufacturers');
      if (!response.ok) throw new Error('Failed to fetch manufacturers');
      const data = await response.json();
      setManufacturers(data);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/attributes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">シリーズ管理</h1>
      </div>

      <SeriesManager manufacturers={manufacturers} isLoading={isLoading} />
    </div>
  );
}
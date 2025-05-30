"use client";

import { useState, useEffect } from 'react';

interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  type: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export function useManufacturers() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/attributes?type=MANUFACTURER');
      if (response.ok) {
        const data = await response.json();
        // MANUFACTURERタイプのみをフィルタ
        const manufacturerData = data.filter((attr: any) => attr.type === 'MANUFACTURER');
        setManufacturers(manufacturerData);
      } else {
        setError('Failed to fetch manufacturers');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error fetching manufacturers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  return {
    manufacturers,
    loading,
    error,
    refetch: fetchManufacturers,
  };
}
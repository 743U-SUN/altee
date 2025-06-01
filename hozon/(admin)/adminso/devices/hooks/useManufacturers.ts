"use client";

import { useState, useEffect } from 'react';

interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  isActive: boolean;
}

export function useManufacturers() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/manufacturers');
      if (response.ok) {
        const data = await response.json();
        setManufacturers(data);
      } else {
        console.error('Failed to fetch manufacturers:', response.status);
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
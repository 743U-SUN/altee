import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ManufacturerManager } from '../components/ManufacturerManager';

export const metadata = {
  title: 'メーカー管理 | Admin Dashboard',
  description: 'デバイスメーカーの管理',
};

export default async function ManufacturersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <ManufacturerManager />;
}
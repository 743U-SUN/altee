/**
 * サービス管理関連のサーバーアクション
 */
'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { LinkServiceOperations, IconOperations } from '@/lib/links/linkService';
import { serviceSchema, validateFormData } from '@/lib/links/validation';
import type { ServiceFilters, ServiceFormData } from '@/types/link';

// 管理者権限チェック
async function checkAdminPermission() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' };
  }
  return { success: true };
}

// ========== ユーザー向けサービス取得 ==========

/**
 * ユーザー向けアクティブサービス一覧を取得
 */
export async function getActiveServices() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: '認証が必要です' };
    }

    // ユーザー向けはアクティブなサービスのみ取得
    const services = await LinkServiceOperations.getServices({
      isActive: true
    });

    return { 
      success: true,
      data: services 
    };
  } catch (error) {
    console.error('getActiveServices error:', error);
    return { success: false, error: 'サービスの取得に失敗しました' };
  }
}

// ========== 管理者向けサービス管理 ==========

/**
 * 管理者用サービス一覧を取得
 */
export async function getServicesForAdmin(filters?: ServiceFilters) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const services = await LinkServiceOperations.getServices(filters || {});

    return { 
      success: true,
      data: services 
    };
  } catch (error) {
    console.error('getServicesForAdmin error:', error);
    return { success: false, error: 'サービスの取得に失敗しました' };
  }
}

/**
 * 特定のサービスを取得
 */
export async function getServiceById(serviceId: string) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }
    
    const service = await LinkServiceOperations.getServiceById(serviceId);

    if (!service) {
      return { success: false, error: 'サービスが見つかりません' };
    }

    return { 
      success: true,
      data: service 
    };
  } catch (error) {
    console.error('getServiceById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'サービスの取得に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * サービスを作成
 */
export async function createService(data: ServiceFormData) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }
    
    // バリデーション
    const validation = validateFormData(serviceSchema, data);
    
    if (!validation.success) {
      return { 
        success: false,
        error: 'バリデーションエラー',
        details: validation.errors 
      };
    }

    // サービス作成
    const serviceData = {
      ...validation.data!,
      // デフォルト値を確実に設定
      allowOriginalIcon: validation.data!.allowOriginalIcon ?? true
    };
    
    const service = await LinkServiceOperations.createService(serviceData);

    revalidatePath('/admin/links');

    return { 
      success: true,
      data: service,
      message: 'サービスを作成しました'
    };
  } catch (error) {
    console.error('createService error:', error);
    const errorMessage = error instanceof Error ? error.message : 'サービスの作成に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * サービスを更新
 */
export async function updateService(serviceId: string, data: Partial<ServiceFormData>) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }
    
    const service = await LinkServiceOperations.updateService(serviceId, data);

    revalidatePath('/admin/links');

    return { 
      success: true,
      data: service,
      message: 'サービスを更新しました'
    };
  } catch (error) {
    console.error('updateService error:', error);
    const errorMessage = error instanceof Error ? error.message : 'サービスの更新に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * サービスを削除
 */
export async function deleteService(serviceId: string) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }
    
    await LinkServiceOperations.deleteService(serviceId);

    revalidatePath('/admin/links');

    return { 
      success: true,
      message: 'サービスを削除しました'
    };
  } catch (error) {
    console.error('deleteService error:', error);
    const errorMessage = error instanceof Error ? error.message : 'サービスの削除に失敗しました';
    return { 
      success: false, 
      error: errorMessage,
      statusCode: error instanceof Error && error.message.includes('使用中') ? 400 : 500
    };
  }
}

// ========== アイコン管理 ==========

/**
 * サービス別アイコン一覧を取得
 */
export async function getIconsByService(serviceId: string) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }
    
    const icons = await IconOperations.getIconsByService(serviceId);

    return { 
      success: true,
      data: icons 
    };
  } catch (error) {
    console.error('getIconsByService error:', error);
    const errorMessage = error instanceof Error ? error.message : 'アイコンの取得に失敗しました';
    return { success: false, error: errorMessage };
  }
}
/**
 * 個別デバイスAPI
 * GET /api/devices/[deviceId] - デバイス詳細取得
 * PUT /api/devices/[deviceId] - デバイス更新
 * DELETE /api/devices/[deviceId] - デバイス削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateDeviceSchema } from '@/lib/validation/device-validation';

interface Params {
  params: Promise<{ deviceId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { deviceId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const device = await prisma.userDevice.findFirst({
      where: {
        id: parseInt(deviceId),
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'デバイスが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('GET /api/devices/[deviceId] error:', error);
    return NextResponse.json(
      { error: 'デバイスの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { deviceId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateDeviceSchema.parse(body);

    // デバイスの所有者確認
    const device = await prisma.userDevice.findFirst({
      where: {
        id: parseInt(deviceId),
        userId: session.user.id,
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'デバイスが見つかりません' },
        { status: 404 }
      );
    }

    // 更新
    const updatedDevice = await prisma.userDevice.update({
      where: { id: parseInt(deviceId) },
      data: { note: validated.note },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ device: updatedDevice });
  } catch (error) {
    console.error('PUT /api/devices/[deviceId] error:', error);
    return NextResponse.json(
      { error: 'デバイスの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { deviceId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // デバイスの所有者確認
    const device = await prisma.userDevice.findFirst({
      where: {
        id: parseInt(deviceId),
        userId: session.user.id,
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'デバイスが見つかりません' },
        { status: 404 }
      );
    }

    // 削除
    await prisma.userDevice.delete({
      where: { id: parseInt(deviceId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/devices/[deviceId] error:', error);
    return NextResponse.json(
      { error: 'デバイスの削除に失敗しました' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTemporaryHandle } from '@/lib/validation/handleValidation';

/**
 * ユーザー作成・更新API
 * auth.tsから呼び出されて、エッジランタイム環境を回避してデータベース操作を実行
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, image, provider, providerAccountId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 既存ユーザーの確認
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        iconUrl: true,
        handle: true,
        role: true,
        bannerUrl: true,
        characterName: true,
        handleChangeTokens: true,
        handleChangeCount: true,
      },
    });

    if (user) {
      // 既存ユーザーの場合、必要に応じて情報を更新
      const updateData: any = {};
      if (name && name !== user.name) updateData.name = name;
      if (image && image !== user.iconUrl) updateData.iconUrl = image;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            iconUrl: true,
            handle: true,
            role: true,
            bannerUrl: true,
            characterName: true,
            handleChangeTokens: true,
            handleChangeCount: true,
          },
        });
      }

      // アカウント連携の確認・作成
      if (provider && providerAccountId) {
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
        });

        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: user.id,
              type: 'oauth',
              provider,
              providerAccountId,
            },
          });
        }
      }

      return NextResponse.json(user);
    } else {
      // 新規ユーザーの作成
      const randomString = Math.random().toString(36).substring(2, 10);
      const temporaryHandle = `temp_${randomString}`;

      user = await prisma.user.create({
        data: {
          email,
          name,
          iconUrl: image,
          handle: temporaryHandle,
          role: 'user',
          handleChangeTokens: 1,
          handleChangeCount: 0,
        },
        select: {
          id: true,
          email: true,
          name: true,
          iconUrl: true,
          handle: true,
          role: true,
          bannerUrl: true,
          characterName: true,
          handleChangeTokens: true,
          handleChangeCount: true,
        },
      });

      // アカウント連携の作成
      if (provider && providerAccountId) {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider,
            providerAccountId,
          },
        });
      }

      return NextResponse.json(user);
    }
  } catch (error) {
    console.error('Error in user creation/update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
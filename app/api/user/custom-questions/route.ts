import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId, question, answer, sortOrder } = await request.json();

    // リクエスト検証
    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // データベースに保存
    const customQuestion = await prisma.userCustomQuestion.create({
      data: {
        userId,
        question: question || '',
        answer: answer || '',
        sortOrder: sortOrder || 0
      }
    });

    return NextResponse.json({
      id: customQuestion.id,
      question: customQuestion.question,
      answer: customQuestion.answer,
      sortOrder: customQuestion.sortOrder,
      message: 'Q&Aを追加しました'
    });

  } catch (error) {
    console.error('Q&A追加エラー:', error);
    return NextResponse.json(
      { error: 'Q&Aの追加に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId, questionId } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: 'Q&AのIDが必要です' },
        { status: 400 }
      );
    }

    // 削除対象のQ&Aを取得
    const customQuestion = await prisma.userCustomQuestion.findUnique({
      where: { id: questionId }
    });

    if (!customQuestion || customQuestion.userId !== userId) {
      return NextResponse.json(
        { error: 'Q&Aが見つかりません' },
        { status: 404 }
      );
    }

    // データベースから削除
    await prisma.userCustomQuestion.delete({
      where: { id: questionId }
    });

    // 削除後の並び順を調整
    const remainingQuestions = await prisma.userCustomQuestion.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' }
    });

    // 並び順を更新
    await Promise.all(
      remainingQuestions.map((item, index) =>
        prisma.userCustomQuestion.update({
          where: { id: item.id },
          data: { sortOrder: index }
        })
      )
    );

    return NextResponse.json({
      message: 'Q&Aを削除しました'
    });

  } catch (error) {
    console.error('Q&A削除エラー:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId, questions, questionId, question, answer } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // 質問・回答の更新の場合
    if (questionId && (question !== undefined || answer !== undefined)) {
      // バリデーション
      if (question !== undefined) {
        if (!question.trim()) {
          return NextResponse.json(
            { error: '質問を入力してください' },
            { status: 400 }
          );
        }
        if (question.length > 20) {
          return NextResponse.json(
            { error: '質問は20文字以内で入力してください' },
            { status: 400 }
          );
        }
      }

      if (answer !== undefined) {
        if (!answer.trim()) {
          return NextResponse.json(
            { error: '回答を入力してください' },
            { status: 400 }
          );
        }
        if (answer.length > 50) {
          return NextResponse.json(
            { error: '回答は50文字以内で入力してください' },
            { status: 400 }
          );
        }
      }

      const customQuestion = await prisma.userCustomQuestion.findUnique({
        where: { id: questionId }
      });

      if (!customQuestion || customQuestion.userId !== userId) {
        return NextResponse.json(
          { error: 'Q&Aが見つかりません' },
          { status: 404 }
        );
      }

      const updateData: any = {};
      if (question !== undefined) updateData.question = question.trim();
      if (answer !== undefined) updateData.answer = answer.trim();

      await prisma.userCustomQuestion.update({
        where: { id: questionId },
        data: updateData
      });

      return NextResponse.json({
        message: 'Q&Aを更新しました'
      });
    }

    // 並び順更新の場合
    if (Array.isArray(questions)) {
      // 並び順を更新
      await Promise.all(
        questions.map((item) =>
          prisma.userCustomQuestion.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder }
          })
        )
      );

      return NextResponse.json({
        message: '並び順を更新しました'
      });
    }

    return NextResponse.json(
      { error: '更新データが不正です' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Q&A更新エラー:', error);
    return NextResponse.json(
      { error: '更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    const customQuestions = await prisma.userCustomQuestion.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({
      questions: customQuestions
    });

  } catch (error) {
    console.error('Q&A取得エラー:', error);
    return NextResponse.json(
      { error: 'Q&Aの取得に失敗しました' },
      { status: 500 }
    );
  }
}
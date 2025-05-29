import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { runScheduledUpdate, getUpdateStatistics } from "@/lib/actions/scheduled-update-actions";

/**
 * GET /api/admin/scheduled-update
 * 更新統計情報を取得
 */
export async function GET() {
  try {
    const session = await auth();
    
    // 管理者権限チェック
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const statistics = await getUpdateStatistics();
    
    return NextResponse.json({
      success: true,
      statistics,
    });
  } catch (error) {
    console.error("Error getting update statistics:", error);
    return NextResponse.json(
      { error: "Failed to get update statistics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/scheduled-update
 * 定期更新を手動で実行
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // 管理者権限チェック
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // オプションでCronシークレットキーをチェック（本番環境用）
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Invalid cron secret" },
        { status: 401 }
      );
    }

    // 定期更新を実行
    const results = await runScheduledUpdate();
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error running scheduled update:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled update" },
      { status: 500 }
    );
  }
}

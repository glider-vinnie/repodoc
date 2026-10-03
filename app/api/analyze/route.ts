import { NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/analyzer";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log("[api/analyze] POST request received");
    const body = await req.json().catch(() => ({}));
    const repoUrl = body?.repoUrl || body?.url;

    if (!repoUrl || typeof repoUrl !== "string" || repoUrl.trim() === "") {
      console.log("[api/analyze] Missing or invalid repository URL parameter");
      return NextResponse.json(
        { error: "Repository URL is required." },
        { status: 400 }
      );
    }

    console.log(`[api/analyze] Triggering analysis for URL: ${repoUrl}`);
    const result = await analyzeRepository(repoUrl);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.log("[api/analyze] Exception in POST handler:", err);
    return NextResponse.json(
      {
        error: err?.message || "Internal server error during analysis.",
      },
      { status: 500 }
    );
  }
}

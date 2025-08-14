import { NextRequest, NextResponse } from "next/server";
import { indexBlogPostsToAlgolia } from "@/lib/algolia/indexing";

export async function POST(request: NextRequest) {
  try {

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await indexBlogPostsToAlgolia();

    return NextResponse.json(
      { message: "Blog posts indexed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error indexing blog posts:", error);
    return NextResponse.json(
      { error: "Failed to index blog posts" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Use POST to trigger indexing" },
    { status: 405 },
  );
}

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data: countData } = await supabase
    .from("view_counts")
    .select("total_views")
    .eq("id", 1)
    .single();

  const { data: logs } = await supabase
    .from("visitor_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return NextResponse.json({
    views: countData?.total_views || 0,
    logs: logs || [],
  });
}


export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createServerClient();

  await supabase.from("view_counts").update({
    total_views: Number(body.views || 0)
  }).eq("id", 1);

  return NextResponse.json({ success: true });
}

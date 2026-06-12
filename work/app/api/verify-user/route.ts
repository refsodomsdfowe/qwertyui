import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function parseDevice(ua: string) {
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone") || ua.includes("iPad")
          ? "iOS"
          : ua.includes("Linux")
            ? "Linux"
            : "Unknown";

  const browser = ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Edg")
      ? "Edge"
      : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Safari")
          ? "Safari"
          : "Unknown";

  return { isMobile, os, browser };
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.password !== process.env.USER_PASSWORD) {
    return NextResponse.json({ success: false });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";
  const referrer = body.referrer || req.headers.get("referer") || "direct";
  const visitorId = body.visitorId || "unknown";

  let geo = { country: "unknown", city: "unknown", isp: "unknown" };

  if (ip !== "unknown" && ip !== "::1" && !ip.startsWith("127.")) {
    try {
      const res = await fetch(`https://ip-api.com/json/${ip}?fields=country,city,isp,status`);
      const data = await res.json();
      if (data.status === "success") {
        geo = { country: data.country, city: data.city, isp: data.isp };
      }
    } catch {}
  }

  const device = parseDevice(userAgent);
  const supabase = createServerClient();

  const { error: logError } = await supabase.from("visitor_logs").insert({
    ip,
    country: geo.country,
    city: geo.city,
    isp: geo.isp,
    is_mobile: device.isMobile,
    os: device.os,
    browser: device.browser,
    referrer,
    visitor_id: visitorId,
  });

  if (logError) {
    console.error("Log insert error:", logError);
  }

  const { error: countError } = await supabase.rpc("increment_view_count");

  if (countError) {
    // Fallback: manual increment
    const { data: current } = await supabase
      .from("view_counts")
      .select("total_views")
      .eq("id", 1)
      .single();

    if (current) {
      await supabase
        .from("view_counts")
        .update({ total_views: current.total_views + 1 })
        .eq("id", 1);
    }
  }

  return NextResponse.json({ success: true });
}

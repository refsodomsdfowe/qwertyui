"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  ShieldAlert,
  Globe,
  Monitor,
  Smartphone,
  MapPin,
  Wifi,
  Clock,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface LogEntry {
  id: number;
  ip: string;
  country: string;
  city: string;
  isp: string;
  is_mobile: boolean;
  os: string;
  browser: string;
  referrer: string;
  visitor_id: string;
  created_at: string;
}

interface AdminData {
  views: number;
  logs: LogEntry[];
}

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(45, 80%, 55%)",
  "hsl(190, 70%, 50%)",
  "hsl(100, 50%, 50%)",
];

export default function Admin() {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [authToken, setAuthToken] = useState("");

  const fetchData = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { authorization: token },
      });
      if (res.status === 401) {
        setError("Unauthorized");
        setAuth(false);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  async function login() {
    if (!pass) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin", {
        headers: { authorization: pass },
      });
      if (res.ok) {
        setAuthToken(pass);
        setAuth(true);
        const json = await res.json();
        setData(json);
      } else {
        setError("Invalid admin password");
      }
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth && authToken) {
      const interval = setInterval(() => fetchData(authToken), 30000);
      return () => clearInterval(interval);
    }
  }, [auth, authToken, fetchData]);

  // Computed analytics
  const uniqueVisitors = data
    ? new Set(data.logs.map((l) => l.visitor_id)).size
    : 0;
  const mobileCount = data
    ? data.logs.filter((l) => l.is_mobile).length
    : 0;
  const desktopCount = data ? data.logs.length - mobileCount : 0;

  const osBreakdown = data
    ? Object.entries(
        data.logs.reduce<Record<string, number>>((acc, l) => {
          acc[l.os] = (acc[l.os] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const browserBreakdown = data
    ? Object.entries(
        data.logs.reduce<Record<string, number>>((acc, l) => {
          acc[l.browser] = (acc[l.browser] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const countryBreakdown = data
    ? Object.entries(
        data.logs.reduce<Record<string, number>>((acc, l) => {
          if (l.country !== "unknown") {
            acc[l.country] = (acc[l.country] || 0) + 1;
          }
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const referrerBreakdown = data
    ? Object.entries(
        data.logs.reduce<Record<string, number>>((acc, l) => {
          let ref = "Unknown"; try { ref = l.referrer === "direct" ? "Direct" : new URL(l.referrer).hostname; } catch {}
          acc[ref] = (acc[ref] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  // Timeline data (group by hour)
  const timelineData = data
    ? Object.entries(
        data.logs.reduce<Record<string, number>>((acc, l) => {
          const hour = new Date(l.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
          });
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([time, views]) => ({ time, views }))
        .reverse()
    : [];

  const deviceData = [
    { name: "Mobile", value: mobileCount },
    { name: "Desktop", value: desktopCount },
  ].filter((d) => d.value > 0);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-destructive/5" />
        <div className="absolute top-1/4 -left-24 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-1">
              Admin Access
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Administrator credentials required
            </p>

            <input
              className="w-full h-12 bg-secondary/50 border border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive/50 transition-all mb-4"
              type="password"
              placeholder="Admin password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />

            <button
              className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              onClick={login}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Authenticate
                </>
              )}
            </button>

            {error && (
              <p className="text-destructive text-sm text-center mt-3">
                {error}
              </p>
            )}

            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <a
                href="/"
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Back to User Gate
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-bold text-lg">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(authToken)}
              className="h-9 px-3 rounded-lg bg-secondary/50 border border-border/50 text-sm flex items-center gap-2 hover:bg-secondary transition-all"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => {
                setAuth(false);
                setData(null);
                setPass("");
              }}
              className="h-9 px-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 hover:bg-destructive/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Eye className="w-5 h-5" />}
            label="Total Views"
            value={data.views}
            colorClass="bg-primary/10 text-primary"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Unique Visitors"
            value={uniqueVisitors}
            colorClass="bg-chart-2/10 text-chart-2"
          />
          <StatCard
            icon={<Smartphone className="w-5 h-5" />}
            label="Mobile Visits"
            value={mobileCount}
            colorClass="bg-chart-3/10 text-chart-3"
          />
          <StatCard
            icon={<Monitor className="w-5 h-5" />}
            label="Desktop Visits"
            value={desktopCount}
            colorClass="bg-chart-4/10 text-chart-4"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Timeline */}
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Visit Timeline</h2>
            </div>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(215, 20%, 55%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 55%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(217, 91%, 60%)"
                    fill="url(#colorViews)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No timeline data yet
              </div>
            )}
          </div>

          {/* Device breakdown */}
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Device Breakdown</h2>
            </div>
            {deviceData.length > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 8%)",
                        border: "1px solid hsl(217, 33%, 17%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {deviceData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i] }}
                        />
                        <span className="text-sm">{d.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {d.value} ({data.logs.length > 0 ? Math.round((d.value / data.logs.length) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No device data yet
              </div>
            )}
          </div>
        </div>

        {/* Second charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* OS Breakdown */}
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Operating Systems</h2>
            </div>
            {osBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={osBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 55%)" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 55%)" width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No OS data yet
              </div>
            )}
          </div>

          {/* Browser Breakdown */}
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Browsers</h2>
            </div>
            {browserBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={browserBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {browserBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No browser data yet
              </div>
            )}
            {browserBreakdown.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {browserBreakdown.map((b, i) => (
                  <span
                    key={b.name}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/50"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {b.name} ({b.value})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Countries */}
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Countries</h2>
            </div>
            {countryBreakdown.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {countryBreakdown.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm">{c.name}</span>
                    </div>
                    <span className="text-sm font-medium">{c.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No country data yet
              </div>
            )}
          </div>
        </div>

        {/* Referrer breakdown */}
        {referrerBreakdown.length > 0 && (
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Referrers</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {referrerBreakdown.map((r, i) => (
                <span
                  key={r.name}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {r.name} <span className="text-muted-foreground">({r.value})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Visitor logs */}
        <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Visitor Log</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {data.logs.length} entries
            </span>
          </div>

          {data.logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No visitor logs yet. Visitors will appear here after authenticating.
            </div>
          ) : (
            <div className="space-y-2">
              {data.logs.map((log) => {
                const isExpanded = expandedLog === log.id;
                return (
                  <div
                    key={log.id}
                    className="bg-secondary/30 border border-border/30 rounded-lg overflow-hidden transition-all"
                  >
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
                      onClick={() =>
                        setExpandedLog(isExpanded ? null : log.id)
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          {log.is_mobile ? (
                            <Smartphone className="w-4 h-4 text-chart-3" />
                          ) : (
                            <Monitor className="w-4 h-4 text-chart-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">
                              {log.ip}
                            </span>
                            {log.country !== "unknown" && (
                              <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                                {log.country}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {log.os} / {log.browser}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/20">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                          <DetailItem
                            icon={<Globe className="w-3.5 h-3.5" />}
                            label="Country"
                            value={log.country}
                          />
                          <DetailItem
                            icon={<MapPin className="w-3.5 h-3.5" />}
                            label="City"
                            value={log.city}
                          />
                          <DetailItem
                            icon={<Wifi className="w-3.5 h-3.5" />}
                            label="ISP"
                            value={log.isp}
                          />
                          <DetailItem
                            icon={<Monitor className="w-3.5 h-3.5" />}
                            label="OS"
                            value={log.os}
                          />
                          <DetailItem
                            icon={<Globe className="w-3.5 h-3.5" />}
                            label="Browser"
                            value={log.browser}
                          />
                          <DetailItem
                            icon={<Smartphone className="w-3.5 h-3.5" />}
                            label="Device"
                            value={log.is_mobile ? "Mobile" : "Desktop"}
                          />
                          <DetailItem
                            icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                            label="Referrer"
                            value={
                              log.referrer === "direct"
                                ? "Direct"
                                : log.referrer
                            }
                          />
                          <DetailItem
                            icon={<Clock className="w-3.5 h-3.5" />}
                            label="Time"
                            value={new Date(log.created_at).toLocaleString()}
                          />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground/50">
                          Visitor ID: {log.visitor_id}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium truncate" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

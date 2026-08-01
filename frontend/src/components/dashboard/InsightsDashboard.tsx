"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Package,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { fetchAnalytics, type AnalyticsData } from "@/lib/api";
import { useAppData } from "@/context/AppDataContext";
import { AiStackInsightCard } from "@/components/dashboard/AiStackInsightCard";

/* ── Animated count-up ───────────────────────────────────────────────── */
function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    function step(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, duration]);

  return <>{val}</>;
}

/* ── Skeleton block ──────────────────────────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

/* ── Signal label map ────────────────────────────────────────────────── */
const SIGNAL_LABELS: Record<string, string> = {
  commit_velocity: "Commit velocity",
  maintainer_activity: "Maintainer activity",
  security_hygiene: "Security hygiene",
  issue_resolution: "Issue resolution",
  funding: "Funding",
  community_health: "Community health",
};

/* ── Ecosystem colors — monochrome gray scale, theme-safe ──────────────── */
const ECO_COLORS: Record<string, string> = {
  npm: "#8a8d99",
  pypi: "#71747f",
  cargo: "#9a9da8",
  maven: "#5c5f68",
  gem: "#adb0b9",
  go: "#4a4d55",
};

/* Single accent (brand orange) reserved for genuine severity signal;
   everything else reads as neutral gray, per "keep it monotonous" direction. */
const TIER_COLOR: Record<string, string> = {
  critical: "#ff6600",
  at_risk: "#8a8d99",
  "at-risk": "#8a8d99",
  watch: "#a3a6b0",
  healthy: "#c2c4cb",
};

/* ── Mock fallback data ──────────────────────────────────────────────── */
function buildMockAnalytics(): AnalyticsData {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000);
    return {
      date: d.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 5),
    };
  });
  return {
    alertTrend: days,
    ecosystemDist: [
      { ecosystem: "npm", count: 142 },
      { ecosystem: "pypi", count: 67 },
      { ecosystem: "cargo", count: 28 },
      { ecosystem: "go", count: 18 },
    ],
    spsHistogram: [
      { bucket: "0–20", min: 0, max: 20, count: 4 },
      { bucket: "20–40", min: 20, max: 40, count: 8 },
      { bucket: "40–60", min: 40, max: 60, count: 22 },
      { bucket: "60–80", min: 60, max: 80, count: 48 },
      { bucket: "80–100", min: 80, max: 100, count: 73 },
    ],
    signalAverages: [
      { signal: "commit_velocity", avg: 68 },
      { signal: "maintainer_activity", avg: 71 },
      { signal: "security_hygiene", avg: 55 },
      { signal: "issue_resolution", avg: 62 },
      { signal: "funding", avg: 34 },
      { signal: "community_health", avg: 74 },
    ],
    topDeclining: [
      {
        id: "1",
        name: "request",
        spsDrop: 18,
        currentSps: 24,
        tier: "critical",
      },
      { id: "2", name: "moment", spsDrop: 12, currentSps: 38, tier: "at_risk" },
      {
        id: "3",
        name: "left-pad",
        spsDrop: 9,
        currentSps: 15,
        tier: "critical",
      },
      { id: "4", name: "bower", spsDrop: 7, currentSps: 32, tier: "at_risk" },
      { id: "5", name: "node-sass", spsDrop: 6, currentSps: 41, tier: "watch" },
    ],
    topImproving: [
      { id: "6", name: "eslint", spsGain: 11, currentSps: 88, tier: "healthy" },
      { id: "7", name: "axios", spsGain: 8, currentSps: 82, tier: "healthy" },
      { id: "8", name: "webpack", spsGain: 5, currentSps: 79, tier: "watch" },
    ],
    alertsByType: {
      tier_change: 12,
      threshold: 8,
      recovery: 4,
      supply_chain: 2,
    },
    weeklyAlertCount: 14,
  };
}

/* ── Custom tooltip ──────────────────────────────────────────────────── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && (
        <p className="mb-1 text-[11px] font-semibold text-dl-muted">{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-bold text-dl-navy">
          {p.value}
        </p>
      ))}
    </div>
  );
}

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}
function AnalyticsCard({
  title,
  subtitle,
  children,
  className = "",
  badge,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dash-panel ${className}`}
    >
      <div className="flex items-start justify-between border-b border-dl-border px-5 py-4">
        <div>
          <p className="text-[13px] font-semibold text-dl-navy">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-dl-muted">{subtitle}</p>
          )}
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function hasAnalyticsData(data: AnalyticsData): boolean {
  return (
    data.alertTrend.some((d) => d.count > 0) ||
    data.ecosystemDist.length > 0 ||
    data.spsHistogram.some((b) => b.count > 0)
  );
}

export function InsightsDashboard() {
  const { dashboard, packages, repos, alerts, loading } = useAppData();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    setAnalyticsLoading(true);

    fetchAnalytics()
      .then((data) => {
        if (cancelled) return;
        const hasPackages = packages.length > 0;
        if (!hasAnalyticsData(data) && !hasPackages) {
          setAnalytics(buildMockAnalytics());
          setIsMock(true);
        } else {
          setAnalytics(data);
          setIsMock(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (packages.length === 0) {
          setAnalytics(buildMockAnalytics());
          setIsMock(true);
        } else {
          setIsMock(false);
        }
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, packages.length]);

  const totalPackages = dashboard?.totalPackages ?? packages.length;
  const critical = dashboard?.healthCounts?.critical ?? 0;
  const atRisk = dashboard?.healthCounts?.atRisk ?? 0;
  const healthy = dashboard?.healthCounts?.healthy ?? 0;
  const weekAgo = Date.now() - 7 * 86_400_000;
  const alertsThisWeek =
    analytics?.weeklyAlertCount ??
    alerts.filter((a) => new Date(a.firedAt).getTime() >= weekAgo).length;

  const scoredPackages = packages.filter((p) => !p.scoringPending);
  const healthyPct =
    scoredPackages.length > 0
      ? Math.round(
          (scoredPackages.filter((p) => p.tier === "healthy").length /
            scoredPackages.length) *
            100,
        )
      : healthy > 0 && totalPackages > 0
        ? Math.round((healthy / totalPackages) * 100)
        : 0;

  const STAT_CARDS = [
    {
      label: "Total packages",
      value: totalPackages,
      icon: Package,
      color: "var(--dl-muted)",
      bg: "var(--dl-surface)",
      suffix: "",
    },
    {
      label: "Stack health",
      value: healthyPct,
      icon: ShieldCheck,
      color: "var(--dl-muted)",
      bg: "var(--dl-surface)",
      suffix: "%",
    },
    {
      label: "Needs attention",
      value: critical + atRisk,
      icon: AlertTriangle,
      color: critical > 0 ? "var(--dl-blue)" : "var(--dl-muted)",
      bg: critical > 0 ? "var(--dl-blue-pale)" : "var(--dl-surface)",
      suffix: "",
    },
    {
      label: "Alerts this week",
      value: alertsThisWeek,
      icon: Activity,
      color: "var(--dl-muted)",
      bg: "var(--dl-surface)",
      suffix: "",
    },
    {
      label: "Repos monitored",
      value: repos.length,
      icon: Zap,
      color: "var(--dl-muted)",
      bg: "var(--dl-surface)",
      suffix: "",
    },
    {
      label: "Avg SPS",
      value: dashboard?.avgSps ? Math.round(dashboard.avgSps) : 0,
      icon: TrendingUp,
      color: "var(--dl-muted)",
      bg: "var(--dl-surface)",
      suffix: "",
    },
  ];

  return (
    <div className="space-y-6">
      {isMock && (
        <div className="flex items-center gap-2.5 rounded-xl border border-dl-blue/20 bg-dl-blue-pale px-4 py-3 text-[12px] font-medium text-dl-blue">
          <Zap className="h-3.5 w-3.5 shrink-0" />
          Showing sample data — connect GitHub and run a scan to see your real
          analytics.
        </div>
      )}

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map(
          ({ label, value, icon: Icon, color, bg, suffix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="dash-stat-card"
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color }} />
              </div>
              <div className="text-[22px] font-bold leading-none tracking-tight text-dl-navy">
                {analyticsLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <>
                    <CountUp to={value} />
                    {suffix}
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] font-medium text-dl-muted">
                {label}
              </p>
            </motion.div>
          ),
        )}
      </div>

      {/* ── AI Stack Insight ── */}
      {!isMock && analytics && !analyticsLoading && (
        <AiStackInsightCard
          analytics={analytics}
          critical={critical}
          atRisk={atRisk}
          watch={dashboard?.healthCounts?.watch ?? 0}
          healthy={healthy}
          avgSps={dashboard?.avgSps ? Math.round(dashboard.avgSps) : 0}
        />
      )}

      {/* ── Row 1: Alert trend + SPS distribution ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[60fr_40fr]">
        {/* Alert trend area chart */}
        <AnalyticsCard
          title="Alert Activity"
          subtitle="Daily alerts fired over the past 14 days"
          badge={
            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-500">
              14 days
            </span>
          }
        >
          {analyticsLoading ? (
            <Skeleton className="h-[160px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart
                data={analytics?.alertTrend}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--dl-chart-grid)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--dl-muted)" }}
                  tickFormatter={(v) => v.slice(5)}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--dl-muted)" }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#alertGrad)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#dc2626",
                    strokeWidth: 2,
                    stroke: "var(--dl-bg)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </AnalyticsCard>

        {/* SPS score histogram */}
        <AnalyticsCard
          title="SPS Distribution"
          subtitle="Packages by score bucket"
        >
          {analyticsLoading ? (
            <Skeleton className="h-[160px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={analytics?.spsHistogram}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--dl-chart-grid)"
                  vertical={false}
                />
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 10, fill: "var(--dl-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--dl-muted)" }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--dl-blue-pale)", fillOpacity: 0.5 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics?.spsHistogram.map((entry, i) => {
                    const colors = [
                      "#dc2626",
                      "#ea580c",
                      "#ca8a04",
                      "#ff6600",
                      "#16a34a",
                    ];
                    return <Cell key={i} fill={colors[i]} fillOpacity={0.85} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </AnalyticsCard>
      </div>

      {/* ── Row 2: Signal radar + Ecosystem pie + Alert types ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Signal averages radar */}
        <AnalyticsCard
          title="Signal Health"
          subtitle="Average score per signal (0–100)"
        >
          {analyticsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart
                data={analytics?.signalAverages.map((s) => ({
                  ...s,
                  subject: SIGNAL_LABELS[s.signal] ?? s.signal,
                }))}
              >
                <PolarGrid stroke="var(--dl-chart-grid)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "var(--dl-muted)" }}
                />
                <Radar
                  dataKey="avg"
                  stroke="var(--dl-blue)"
                  fill="var(--dl-blue)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </AnalyticsCard>

        {/* Ecosystem donut */}
        <AnalyticsCard title="Ecosystem Split" subtitle="Packages by registry">
          {analyticsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={analytics?.ecosystemDist}
                    dataKey="count"
                    nameKey="ecosystem"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {analytics?.ecosystemDist.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={ECO_COLORS[entry.ecosystem] ?? "#9fa0b5"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2">
                {analytics?.ecosystemDist.slice(0, 4).map((e) => (
                  <span
                    key={e.ecosystem}
                    className="flex items-center gap-1 text-[10px] font-semibold text-dl-text"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          ECO_COLORS[e.ecosystem] ?? "var(--dl-muted)",
                      }}
                    />
                    {e.ecosystem}{" "}
                    <span className="text-dl-muted">({e.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </AnalyticsCard>

        {/* Alert by type */}
        <AnalyticsCard title="Alert Breakdown" subtitle="By type this month">
          {analyticsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="space-y-3">
              {Object.entries(analytics?.alertsByType ?? {}).map(
                ([type, count]) => {
                  const total = Object.values(
                    analytics?.alertsByType ?? {},
                  ).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const colors: Record<string, { text: string; bar: string }> =
                    {
                      tier_change: { text: "#dc2626", bar: "#dc2626" },
                      threshold: { text: "#ea580c", bar: "#ea580c" },
                      recovery: { text: "#16a34a", bar: "#16a34a" },
                      supply_chain: { text: "#ca8a04", bar: "#ca8a04" },
                    };
                  const c = colors[type] ?? {
                    text: "var(--dl-muted)",
                    bar: "var(--dl-border)",
                  };
                  return (
                    <div key={type}>
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className="flex items-center gap-1.5 text-[11px] font-semibold"
                          style={{ color: c.text }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: c.bar }}
                          />
                          {type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] font-bold text-dl-navy">
                          {count}
                        </span>
                      </div>
                      <div className="progress-track">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: c.bar }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </AnalyticsCard>
      </div>

      {/* ── Row 3: Top declining + Top improving ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Top declining packages */}
        <AnalyticsCard
          title="Biggest Declines"
          subtitle="Packages with the steepest SPS drop"
          badge={<TrendingDown className="h-4 w-4 text-red-400" />}
        >
          {analyticsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : analytics?.topDeclining.length === 0 ? (
            <p className="text-[13px] text-dl-muted">
              No declining packages detected.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics?.topDeclining.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl border border-dl-border p-3 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-[10px] font-bold text-red-500">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-semibold text-dl-navy">
                      {pkg.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-dl-muted">
                        SPS {pkg.currentSps}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                          background: TIER_COLOR[pkg.tier]
                            ? `${TIER_COLOR[pkg.tier]}25`
                            : "var(--dl-surface)",
                          color: TIER_COLOR[pkg.tier] ?? "var(--dl-muted)",
                        }}
                      >
                        {pkg.tier}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    <span className="text-[12px] font-bold">{pkg.spsDrop > 0 ? pkg.spsDrop : '—'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnalyticsCard>

        {/* Top improving packages */}
        <AnalyticsCard
          title="Biggest Improvements"
          subtitle="Packages with the greatest SPS gain"
          badge={<TrendingUp className="h-4 w-4 text-green-500" />}
        >
          {analyticsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : analytics?.topImproving.length === 0 ? (
            <p className="text-[13px] text-dl-muted">
              No improving packages yet.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics?.topImproving.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl border border-dl-border p-3 hover:border-green-500/30 hover:bg-green-500/10 transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-[10px] font-bold text-green-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[13px] font-semibold text-dl-navy">
                      {pkg.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-dl-muted">
                        SPS {pkg.currentSps}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                          background: TIER_COLOR[pkg.tier]
                            ? `${TIER_COLOR[pkg.tier]}25`
                            : "var(--dl-surface)",
                          color: TIER_COLOR[pkg.tier] ?? "var(--dl-muted)",
                        }}
                      >
                        {pkg.tier}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="text-[12px] font-bold">{pkg.spsGain > 0 ? pkg.spsGain : '—'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnalyticsCard>
      </div>
    </div>
  );
}

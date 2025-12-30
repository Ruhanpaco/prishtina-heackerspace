"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import {
    ShieldAlert, Fingerprint, Activity, Zap, TrendingUp,
    AlertTriangle, Globe, Loader2, CheckCircle, Shield, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";

interface AnalyticsData {
    topFailingIPs: { _id: string; count: number }[];
    severityTrend: { _id: { hour: number; severity: string }; count: number }[];
    eventStats: { _id: string; count: number }[];
    statusRatio: { _id: string; count: number }[];
    weeklyTrend: { _id: string; count: number }[];
    categoryVolume: { _id: string; count: number }[];
    securityBaseline?: {
        avgFailuresPerHour: number;
        stdDevFailuresPerHour: number;
        sampleSize: number;
        lastUpdated: string;
    };
    timeRange: string;
}

interface ThreatEntry {
    _id: string;
    ipAddress: string;
    threatType: string;
    severity: string;
    status: string;
    evidenceCount: number;
    lastDetected: string;
    userId?: { name: string; email: string };
    metadata: any;
}

export function SecurityIntelligenceContent() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [threats, setThreats] = useState<ThreatEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setIsLoading(true);
        await Promise.all([fetchAnalytics(), fetchThreats()]);
        setIsLoading(false);
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/v2/GET/admin/logs/analytics");
            const result = await res.json();
            if (res.ok) setData(result);
        } catch (error) {
            console.error("Failed to fetch security analytics", error);
        }
    };

    const fetchThreats = async () => {
        try {
            const res = await fetch("/api/v2/GET/admin/security/threats");
            const result = await res.json();
            if (res.ok) setThreats(result.threats || []);
        } catch (error) {
            console.error("Failed to fetch security threats", error);
        }
    };

    const updateThreat = async (threatId: string, status: string) => {
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch("/api/v2/PATCH/admin/security/threats", {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ""
                },
                body: JSON.stringify({ threatId, status })
            });
            if (res.ok) fetchThreats();
        } catch (error) {
            console.error("Failed to update threat", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-brand-yellow" />
                    <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-xs">Decrypting Security Patterns...</p>
                </div>
            </div>
        );
    }

    if (!data) return <div>Error loading analytics</div>;

    const COLORS = ['#FFC107', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f97316'];

    // Format trend data for Recharts
    const trendData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        CRITICAL: 0,
        WARNING: 0,
        INFO: 0
    }));

    data.severityTrend.forEach(item => {
        const hourIdx = item._id.hour;
        if (hourIdx >= 0 && hourIdx < 24) {
            (trendData[hourIdx] as any)[item._id.severity] = item.count;
        }
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-accent/5 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                        Security Intelligence
                    </h2>
                    <p className="text-muted-foreground">Advanced threat detection and pattern analysis (Real-time {data.timeRange})</p>
                </div>
                <Button onClick={fetchAll} variant="outline" size="sm" className="gap-2">
                    <Zap className="h-4 w-4 text-brand-yellow" />
                    Refresh Intelligence
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-black text-white border-red-500/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-tighter text-red-400">Active Threats</CardTitle>
                        <Shield className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{threats.length}</div>
                        <p className="text-xs text-red-400 font-mono mt-1">Heuristics-flagged anomalies</p>
                    </CardContent>
                </Card>
                <Card className="bg-black text-white border-brand-yellow/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-tighter text-brand-yellow">Total Events</CardTitle>
                        <Activity className="h-4 w-4 text-brand-yellow" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {data.statusRatio.reduce((acc, curr) => acc + curr.count, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">Indexed audit entries</p>
                    </CardContent>
                </Card>
                <Card className="bg-black text-white border-blue-500/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-tighter text-blue-400">Abuse Vectors</CardTitle>
                        <Globe className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.topFailingIPs.length}</div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">Unique failing source IPs</p>
                    </CardContent>
                </Card>
                <Card className="bg-black text-white border-green-500/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium uppercase tracking-tighter text-green-400">Integrity Ratio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {data.statusRatio.reduce((acc, curr) => acc + curr.count, 0) > 0 ? Math.round((data.statusRatio.find(r => r._id === 'SUCCESS')?.count || 0) /
                                data.statusRatio.reduce((acc, curr) => acc + curr.count, 0) * 100) : 100}%
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">Global success percentage</p>
                    </CardContent>
                </Card>
            </div>

            {/* Heuristic Baseline Card */}
            {data.securityBaseline && (
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-3 bg-brand-yellow/5 border-brand-yellow/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-yellow/10 rounded-full">
                                    <ShieldCheck className="h-6 w-6 text-brand-yellow" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-tighter text-brand-yellow">Heuristic Baseline Health</h4>
                                    <p className="text-[10px] text-muted-foreground italic">Current "normal" failure rate learned from {data.securityBaseline.sampleSize} events.</p>
                                </div>
                            </div>
                            <div className="flex gap-8 text-center">
                                <div>
                                    <div className="text-lg font-mono font-bold text-white">{data.securityBaseline.avgFailuresPerHour.toFixed(2)}</div>
                                    <div className="text-[8px] uppercase text-muted-foreground">Avg Failures/Hr</div>
                                </div>
                                <div>
                                    <div className="text-lg font-mono font-bold text-white">±{data.securityBaseline.stdDevFailuresPerHour.toFixed(2)}</div>
                                    <div className="text-[8px] uppercase text-muted-foreground">Standard Deviation</div>
                                </div>
                                <div>
                                    <div className="text-lg font-mono font-bold text-green-500">OPERATIONAL</div>
                                    <div className="text-[8px] uppercase text-muted-foreground">Engine Status</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 bg-muted/5 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Fingerprint className="h-5 w-5 text-brand-yellow" />
                            Security Event Trend
                        </CardTitle>
                        <CardDescription>Frequency of Warning and Critical events by hour.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFC107" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="hour" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px' }}
                                        itemStyle={{ fontSize: '11px' }}
                                    />
                                    <Area type="monotone" dataKey="CRITICAL" stroke="#ef4444" fillOpacity={1} fill="url(#colorCrit)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="WARNING" stroke="#FFC107" fillOpacity={1} fill="url(#colorWarn)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 bg-muted/5 border-dashed border-2">
                    <CardHeader>
                        <CardTitle>Top Failing IPs (Brute Force Check)</CardTitle>
                        <CardDescription>IP addresses with highest failure counts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topFailingIPs} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                                    <XAxis type="number" stroke="#888" fontSize={10} axisLine={false} />
                                    <YAxis dataKey="_id" type="category" stroke="#888" fontSize={8} width={70} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} />
                                    <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-7 bg-muted/5 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            7-Day Activity Horizon
                        </CardTitle>
                        <CardDescription>Aggregate system volume and trend analysis over the past week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.weeklyTrend}>
                                    <defs>
                                        <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis
                                        dataKey="_id"
                                        stroke="#888"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                    />
                                    <YAxis stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px' }}
                                        labelFormatter={(val: any) => val ? format(new Date(val), 'EEEE, MMM d, yyyy') : ''}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorWeekly)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card className="bg-muted/5 border-red-500/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-red-500">Active Threat Mitigation</CardTitle>
                        <CardDescription>Real-time heuristic flags that require administrative review.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden bg-black/20">
                        <table className="w-full text-sm">
                            <thead className="bg-accent/10 border-b">
                                <tr className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                                    <th className="p-4 text-left">IP Address / Actor</th>
                                    <th className="p-4 text-left">Threat Type</th>
                                    <th className="p-4 text-left">Severity</th>
                                    <th className="p-4 text-left">Evidence</th>
                                    <th className="p-4 text-left">Last Seen</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {threats.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                                            No active security threats detected. System is secure.
                                        </td>
                                    </tr>
                                ) : (
                                    threats.map((threat) => (
                                        <tr key={threat._id} className="hover:bg-red-500/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-mono text-xs font-bold">{threat.ipAddress}</div>
                                                <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                    {threat.userId?.email || 'Guest Actor'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="text-[10px] font-mono border-red-500/30 text-red-400">
                                                    {threat.threatType}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={
                                                    threat.severity === 'CRITICAL' ? 'bg-red-600' :
                                                        threat.severity === 'HIGH' ? 'bg-orange-600' : 'bg-yellow-600'
                                                }>
                                                    {threat.severity}
                                                </Badge>
                                            </td>
                                            <td className="p-4 font-mono text-xs">
                                                {threat.evidenceCount} alerts
                                            </td>
                                            <td className="p-4 text-[10px] text-muted-foreground">
                                                {format(new Date(threat.lastDetected), 'HH:mm:ss')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 text-green-500 hover:bg-green-500/10"
                                                        onClick={() => updateThreat(threat._id, 'RESOLVED')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Resolve
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-muted/5 border-dashed border-2">
                    <CardHeader>
                        <CardTitle>Global Category Distribution</CardTitle>
                        <CardDescription>7-day volume breakdown by functional system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.categoryVolume}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {data.categoryVolume.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {data.categoryVolume.map((stat, i) => (
                                <div key={stat._id} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-mono truncate">{stat._id}</span>
                                    <span className="text-[10px] font-bold ml-auto">{stat.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/5 border-dashed border-2">
                    <CardHeader>
                        <CardTitle>Suspicious Failures Tracker</CardTitle>
                        <CardDescription>Live feed of failing IPs and their specific event types.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topFailingIPs.length > 0 ? (
                                data.topFailingIPs.map((ip, i) => (
                                    <div key={ip._id} className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-500/10 rounded-full">
                                                <Target className="h-4 w-4 text-red-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-mono font-bold">{ip._id}</div>
                                                <div className="text-[10px] text-red-400 uppercase tracking-widest">Active Probe Detected</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-red-500">{ip.count}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Failures</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-muted-foreground italic text-sm">
                                    No suspicious activity clusters detected in the last 24h.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Target(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}

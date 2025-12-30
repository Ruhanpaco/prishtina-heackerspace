"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Zap, ShieldCheck, Activity, MapPin, MousePointer2 } from "lucide-react";

const activityData = [
    { name: "00:00", active: 2 },
    { name: "04:00", active: 0 },
    { name: "08:00", active: 5 },
    { name: "12:00", active: 18 },
    { name: "16:00", active: 24 },
    { name: "20:00", active: 15 },
    { name: "23:59", active: 4 },
];

const growthData = [
    { month: "Jan", users: 40 },
    { month: "Feb", users: 55 },
    { month: "Mar", users: 80 },
    { month: "Apr", users: 110 },
    { month: "May", users: 145 },
    { month: "Jun", users: 190 },
];

export function AdminStatsContent() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/v2/GET/admin/stats");
            const data = await res.json();
            if (res.ok) setStats(data.stats);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Activity className="h-8 w-8 text-brand-yellow" />
                    System Statistics
                </h2>
                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">
                    ● System Live
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                        <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : (stats?.activeMembers || 0)}</div>
                        <p className="text-xs text-muted-foreground">Active membership status</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Presence</CardTitle>
                        <MapPin className="h-4 w-4 text-brand-yellow" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : (stats?.currentPresence || 0)}</div>
                        <p className="text-xs text-muted-foreground">Members currently in-space</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verify Rate</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : `${Math.round(stats?.verifyRate || 0)}%`}</div>
                        <p className="text-xs text-muted-foreground">Users with verified IDs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : (stats?.pendingVerify || 0)}</div>
                        <p className="text-xs text-muted-foreground">Identities awaiting review</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Space Occupancy</CardTitle>
                        <CardDescription>Average number of members checked-in throughout the day.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFC107" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="active" stroke="#FFC107" fillOpacity={1} fill="url(#colorActive)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Member Growth</CardTitle>
                        <CardDescription>Cumulative new signups over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke="#FFC107" strokeWidth={3} dot={{ r: 6, fill: "#FFC107" }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

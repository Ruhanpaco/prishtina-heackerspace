"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardList, AlertCircle, ShieldCheck, Filter, Eye, X, Globe, Terminal } from "lucide-react";
import { format } from "date-fns";

interface LogEntry {
    _id: string;
    timestamp: string;
    event_type: string;
    severity: string;
    actor?: {
        username?: string;
        role?: string;
        userId?: string;
    };
    action: {
        operation: string;
        status: string;
        failure_reason?: string;
    };
    target: {
        resource_type: string;
        resource_id?: string;
    };
    context?: {
        ip_address: string;
        user_agent?: string;
        os?: string;
        browser?: string;
        browser_version?: string;
        cpu_arch?: string;
        device_vendor?: string;
        device_model?: string;
        device_type?: string;
        country?: string;
        request_id?: string;
    };
    forensics?: {
        fingerprint?: string;
        bundle_id?: string;
    };
    metadata?: any;
}

export function AuditLogsContent() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
        limit: 50
    });
    const [filter, setFilter] = useState({
        severity: "all",
        status: "all"
    });

    useEffect(() => {
        // Reset to page 1 when filters change
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [filter]);

    useEffect(() => {
        fetchLogs();
    }, [filter, pagination.page]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            let url = `/api/v2/GET/admin/logs?limit=${pagination.limit}&page=${pagination.page}`;
            if (filter.severity !== "all") url += `&severity=${filter.severity}`;
            if (filter.status !== "all") url += `&status=${filter.status}`;

            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setLogs(data.logs || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages
                    }));
                }
                // Scroll to top on page change
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityBadge = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return <Badge variant="destructive">{sev}</Badge>;
            case 'WARNING': return <Badge className="bg-yellow-500 hover:bg-yellow-600">{sev}</Badge>;
            case 'ERROR': return <Badge variant="destructive">{sev}</Badge>;
            case 'DEBUG': return <Badge variant="outline">{sev}</Badge>;
            default: return <Badge variant="secondary">{sev}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'SUCCESS') return <ShieldCheck className="h-4 w-4 text-green-500" />;
        if (status === 'FAILURE') return <AlertCircle className="h-4 w-4 text-red-500" />;
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 relative overflow-hidden h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ClipboardList className="h-8 w-8 text-brand-yellow" />
                    Security Audit Logs
                </h2>
                <div className="flex gap-2">
                    <Select onValueChange={(val: string) => setFilter({ ...filter, severity: val })}>
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-3 w-3 mr-2" />
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="INFO">Info</SelectItem>
                            <SelectItem value="WARNING">Warning</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="flex-1 overflow-auto">
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>
                        A real-time record of all administrative actions and system events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="p-3 text-left font-medium">Timestamp</th>
                                    <th className="p-3 text-left font-medium">Event</th>
                                    <th className="p-3 text-left font-medium">Actor</th>
                                    <th className="p-3 text-left font-medium">Severity</th>
                                    <th className="p-3 text-left font-medium text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-xs">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="p-8 text-center animate-pulse">Scanning logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No logs found.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-accent/5 transition-colors group">
                                            <td className="p-3 text-muted-foreground font-mono">
                                                {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                                            </td>
                                            <td className="p-3">
                                                <div className="font-semibold text-sm">{log.event_type}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{log.action.operation} - {log.target.resource_type}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">{log.actor?.username || 'System'}</div>
                                                    <div className="text-[10px] text-muted-foreground hidden lg:block italic">({log.actor?.role || 'Service'})</div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {getSeverityBadge(log.severity)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="text-xs text-muted-foreground italic">
                            Showing {logs.length} of {pagination.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1 || isLoading}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                Previous
                            </Button>
                            <div className="text-xs font-mono">
                                Page <span className="text-brand-yellow font-bold">{pagination.page}</span> of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.totalPages || isLoading}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Slide-over */}
            {selectedLog && (
                <div className="fixed inset-y-0 right-0 w-[450px] bg-background border-l shadow-2xl z-50 animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b flex items-center justify-between bg-accent/5">
                            <div>
                                <h3 className="font-bold text-lg">Event Details</h3>
                                <p className="text-xs text-muted-foreground font-mono">{selectedLog._id}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium uppercase text-muted-foreground">Status</span>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(selectedLog.action.status)}
                                        <span className="text-sm font-bold">{selectedLog.action.status}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-accent/10 rounded-lg">
                                        <div className="text-[10px] font-medium uppercase text-muted-foreground mb-1">Time</div>
                                        <div className="text-sm font-mono">{format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss')}</div>
                                    </div>
                                    <div className="p-3 bg-accent/10 rounded-lg">
                                        <div className="text-[10px] font-medium uppercase text-muted-foreground mb-1">Severity</div>
                                        <div>{getSeverityBadge(selectedLog.severity)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-brand-yellow">
                                    <Globe className="h-3 w-3" />
                                    Network Context
                                </h4>
                                <div className="space-y-3 p-4 border rounded-md bg-accent/5">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-muted-foreground uppercase">IP Address</label>
                                            <div className="font-mono text-sm">{selectedLog.context?.ip_address || '—'}</div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground uppercase">Country (Alpha)</label>
                                            <div className="font-medium text-sm">{selectedLog.context?.country || 'Pending...'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">User Agent</label>
                                        <div className="text-[10px] break-words font-mono bg-black/5 p-2 rounded">{selectedLog.context?.user_agent || '—'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-brand-yellow">
                                    <Terminal className="h-3 w-3" />
                                    Device & OS Telemetry
                                </h4>
                                <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-accent/5">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">Operating System</label>
                                        <div className="text-xs font-semibold">{selectedLog.context?.os || 'unknown'}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">Browser</label>
                                        <div className="text-xs font-semibold">{selectedLog.context?.browser || 'unknown'} {selectedLog.context?.browser_version}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">Device</label>
                                        <div className="text-xs font-semibold">
                                            {selectedLog.context?.device_vendor || ''} {selectedLog.context?.device_model || ''}
                                            {!selectedLog.context?.device_vendor && (selectedLog.context?.device_type || 'desktop')}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">CPU Arch</label>
                                        <div className="text-xs font-semibold">{selectedLog.context?.cpu_arch || '—'}</div>
                                    </div>
                                </div>
                            </div>

                            {(selectedLog.context?.request_id || selectedLog.forensics?.fingerprint) && (
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-brand-yellow">
                                        <ShieldCheck className="h-3 w-3" />
                                        Forensic Identifiers
                                    </h4>
                                    <div className="space-y-2 p-4 border rounded-md bg-accent/5 font-mono text-[10px]">
                                        {selectedLog.forensics?.fingerprint && (
                                            <div>
                                                <label className="text-muted-foreground uppercase mr-2">Fingerprint:</label>
                                                <span className="text-brand-yellow font-bold">{selectedLog.forensics.fingerprint}</span>
                                            </div>
                                        )}
                                        {selectedLog.context?.request_id && (
                                            <div>
                                                <label className="text-muted-foreground uppercase mr-2">Request ID:</label>
                                                <span>{selectedLog.context.request_id}</span>
                                            </div>
                                        )}
                                        {selectedLog.forensics?.bundle_id && (
                                            <div>
                                                <label className="text-muted-foreground uppercase mr-2">Bundle ID:</label>
                                                <span>{selectedLog.forensics.bundle_id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-brand-yellow">Structured Metadata</h4>
                                <pre className="p-4 rounded-md bg-black text-[#00ff00] text-[10px] overflow-x-auto font-mono border">
                                    {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                                </pre>
                            </div>

                            {selectedLog.action.failure_reason && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-red-500">Failure Logic</h4>
                                    <div className="p-4 rounded-md bg-red-500/5 border border-red-500/20 text-xs text-red-600 italic">
                                        {selectedLog.action.failure_reason}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

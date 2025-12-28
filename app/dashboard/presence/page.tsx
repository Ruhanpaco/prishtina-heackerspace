"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface UserPresence {
    _id: string;
    name: string;
    username: string;
    image?: string;
    title?: string;
    lastCheckIn: string;
}

export default function PresencePage() {
    const [presenceData, setPresenceData] = useState<{ count: number; users: UserPresence[] }>({
        count: 0,
        users: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchPresence = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/v1/GET/space/presence");
            const data = await res.json();
            if (res.ok) {
                setPresenceData(data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Failed to fetch presence data"
                });
            }
        } catch (error) {
            console.error("Presence Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPresence();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchPresence, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Presence Hub</h2>
                    <p className="text-muted-foreground">
                        Real-time view of members currently at the hackerspace.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={fetchPresence} variant="outline" size="sm" disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Members Inside</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presenceData.count}</div>
                        <p className="text-xs text-muted-foreground">
                            Active scan-ins
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Space Status</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {presenceData.count > 0 ? (
                                <span className="text-green-500">OPEN</span>
                            ) : (
                                <span className="text-yellow-500">EMPTY</span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Based on check-ins
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Who&apos;s In?</CardTitle>
                    <CardDescription>
                        List of members currently checked in via RFID.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {presenceData.users.length === 0 && !isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground/20" />
                                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No one is here yet</h3>
                                <p className="text-sm text-muted-foreground">Scan your RFID card at the entrance to check in.</p>
                            </div>
                        ) : (
                            presenceData.users.map((user) => (
                                <div key={user._id} className="flex items-center">
                                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                                        <AvatarImage src={user.image} alt={user.name} />
                                        <AvatarFallback>{user.name?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            @{user.username} {user.title && `• ${user.title}`}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end space-y-1">
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                            Inside
                                        </Badge>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="mr-1 h-3 w-3" />
                                            since {formatDistanceToNow(new Date(user.lastCheckIn))} ago
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && presenceData.users.length === 0 && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center animate-pulse">
                                        <div className="h-12 w-12 rounded-full bg-muted" />
                                        <div className="ml-4 space-y-2 flex-1">
                                            <div className="h-4 w-1/4 bg-muted rounded" />
                                            <div className="h-3 w-1/2 bg-muted rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

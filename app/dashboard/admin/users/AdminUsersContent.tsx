"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ManagedUser {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    membershipStatus: string;
    identificationStatus: string;
    points: number;
    image?: string;
}

export function AdminUsersContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (status === "authenticated" && (session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF')) {
            fetchUsers();
        } else if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, session]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/v2/GET/users");
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load users" });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading users...</div>;

    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'STAFF') {
        return <div className="p-8 text-destructive">Unauthorized access.</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-8 w-8 text-brand-yellow" />
                    User Management
                </h2>
                <Badge variant="outline" className="text-muted-foreground">
                    {users.length} total members
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Community Members</CardTitle>
                    <CardDescription>
                        Search, manage roles, add contribution points, or handle access status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((u) => (
                            <div key={u._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={u.image} />
                                        <AvatarFallback>{u.name?.charAt(0) || u.username?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{u.name || u.username}</span>
                                            <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-[10px] h-4">
                                                {u.role}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-brand-yellow">{u.points || 0} XP</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Points</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/dashboard/admin/users/${u._id}`}>
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                Manage
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

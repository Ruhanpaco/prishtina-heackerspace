"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AVAILABLE_BADGES } from "@/lib/badges";
import * as Icons from "lucide-react";
import { getCsrfToken } from "next-auth/react";
import { cn } from "@/lib/utils";

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
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleAssignBadges = async () => {
        if (selectedUsers.length === 0 || selectedBadges.length === 0) return;

        setIsAssigning(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch("/api/v2/POST/admin/badges/assign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || "",
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                    badgeIds: selectedBadges,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast({ title: "Success", description: data.message });
                setIsModalOpen(false);
                setSelectedUsers([]);
                setSelectedBadges([]);
                fetchUsers();
            } else {
                throw new Error(data.error || "Failed to assign badges");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Assignment Failed", description: error.message });
        } finally {
            setIsAssigning(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleBadgeSelection = (badgeId: string) => {
        setSelectedBadges(prev =>
            prev.includes(badgeId) ? prev.filter(id => id !== badgeId) : [...prev, badgeId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u._id));
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
                <div className="flex items-center gap-3">
                    {selectedUsers.length > 0 && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold px-6">
                                    <Icons.Award className="h-4 w-4 mr-2" />
                                    Assign Badges ({selectedUsers.length})
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] border-white/10 bg-zinc-900/95 backdrop-blur-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Assign Achievement Badges</DialogTitle>
                                    <DialogDescription className="text-zinc-400">
                                        These badges will be visible on the profiles of the {selectedUsers.length} selected members.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    {AVAILABLE_BADGES.map((badge) => {
                                        const Icon = (Icons as any)[badge.icon] || Icons.HelpCircle;
                                        return (
                                            <div
                                                key={badge.id}
                                                className={cn(
                                                    "flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer",
                                                    selectedBadges.includes(badge.id)
                                                        ? "border-brand-yellow bg-brand-yellow/5"
                                                        : "border-white/5 bg-white/5 hover:bg-white/10"
                                                )}
                                                onClick={() => toggleBadgeSelection(badge.id)}
                                            >
                                                <div className={cn("p-2 rounded-lg bg-zinc-950", badge.color)}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{badge.label}</p>
                                                    <p className="text-[10px] text-zinc-500">{badge.description}</p>
                                                </div>
                                                <Checkbox
                                                    checked={selectedBadges.includes(badge.id)}
                                                    onCheckedChange={() => toggleBadgeSelection(badge.id)}
                                                    className="border-white/20 data-[state=checked]:bg-brand-yellow data-[state=checked]:text-black"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isAssigning}
                                        className="rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAssignBadges}
                                        disabled={isAssigning || selectedBadges.length === 0}
                                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold px-8 rounded-xl shadow-lg shadow-brand-yellow/20"
                                    >
                                        {isAssigning ? "Assigning..." : "Apply Badges"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Badge variant="outline" className="text-muted-foreground h-9 font-medium px-4">
                        {users.length} total members
                    </Badge>
                </div>
            </div>

            <Card className="border-white/5 bg-black/40 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Community Members</CardTitle>
                        <CardDescription>
                            Search, manage roles, add contribution points, or handle access status.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-2">
                            {selectedUsers.length} selected
                        </span>
                        <Checkbox
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onCheckedChange={toggleSelectAll}
                            className="border-white/20 data-[state=checked]:bg-brand-yellow data-[state=checked]:text-black"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((u) => (
                            <div
                                key={u._id}
                                className={cn(
                                    "flex items-center justify-between p-4 border rounded-xl transition-all",
                                    selectedUsers.includes(u._id)
                                        ? "border-brand-yellow/50 bg-brand-yellow/5"
                                        : "border-white/5 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <Checkbox
                                        checked={selectedUsers.includes(u._id)}
                                        onCheckedChange={() => toggleUserSelection(u._id)}
                                        className="border-white/20 data-[state=checked]:bg-brand-yellow data-[state=checked]:text-black"
                                    />
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={u.image} />
                                        <AvatarFallback className="bg-zinc-800">{u.name?.charAt(0) || u.username?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{u.name || u.username}</span>
                                            <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-[10px] h-4 font-bold uppercase tracking-wider">
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
                                        <Button variant="ghost" size="sm" asChild className="rounded-lg hover:bg-white/10">
                                            <a href={`/dashboard/admin/users/${u._id}`}>
                                                <Icons.ExternalLink className="h-4 w-4" />
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

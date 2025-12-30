"use client";

import { useSession, getCsrfToken } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Ban, Unlock, ShieldAlert, Star, CreditCard, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetail {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    membershipStatus: string;
    identificationStatus: string;
    points: number;
    bio?: string;
    title?: string;
    image?: string;
}

export function UserDetailsContent({ userId }: { userId: string }) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userId) fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/v2/GET/users/${userId}`);
            const data = await res.json();
            if (res.ok) setUser(data.user);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load user details" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (updates: Partial<UserDetail>) => {
        setIsSaving(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch(`/api/v2/PATCH/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ""
                },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                toast({ title: "Updated", description: "User record updated successfully." });
                fetchUser();
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const addPoints = (amount: number) => {
        if (!user) return;
        handleUpdate({ points: (user.points || 0) + amount });
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">User not found.</div>;

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Manage User</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-brand-yellow/20">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="text-2xl">{user.name?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle>{user.name || user.username}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                        <div className="pt-2">
                            <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                                {user.role}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">ID Status:</span>
                            <Badge variant={user.identificationStatus === 'VERIFIED' ? 'default' : 'outline'}>
                                {user.identificationStatus}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Membership:</span>
                            <span className="font-medium">{user.membershipStatus}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Contribution & Points */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-brand-yellow" />
                            Contribution Points
                        </CardTitle>
                        <CardDescription>Reward members for their help and projects.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border">
                            <div>
                                <div className="text-3xl font-black text-brand-yellow">{user.points || 0}</div>
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Current XP</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => addPoints(10)}>+10</Button>
                                <Button size="sm" variant="outline" onClick={() => addPoints(50)}>+50</Button>
                                <Button size="sm" variant="outline" onClick={() => addPoints(100)}>+100</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Custom XP Adjustment</Label>
                            <div className="flex gap-2">
                                <Input type="number" placeholder="Enter amount" id="custom-points" className="max-w-[150px]" />
                                <Button size="sm" onClick={() => {
                                    const val = (document.getElementById('custom-points') as HTMLInputElement).value;
                                    if (val) addPoints(parseInt(val));
                                }}>Apply</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role & Access Controls */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            Access & Permissions
                        </CardTitle>
                        <CardDescription>Be careful, these changes affect security and application behavior.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>User Role</Label>
                                <Select
                                    defaultValue={user.role}
                                    onValueChange={(val: string) => handleUpdate({ role: val })}
                                    disabled={!isAdmin}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="MEMBER">Member</SelectItem>
                                        <SelectItem value="STAFF">Staff</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Membership Status</Label>
                                <Select
                                    defaultValue={user.membershipStatus}
                                    onValueChange={(val: string) => handleUpdate({ membershipStatus: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="TRIAL">Trial</SelectItem>
                                        <SelectItem value="LIFETIME">Lifetime</SelectItem>
                                        <SelectItem value="BANNED">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-destructive/5 border-t py-4 flex justify-between">
                        <div className="text-xs text-muted-foreground max-w-[200px]">
                            Banning a user revokes all access immediately.
                        </div>
                        <Button
                            variant={user.membershipStatus === 'BANNED' ? 'outline' : 'destructive'}
                            size="sm"
                            onClick={() => handleUpdate({ membershipStatus: user.membershipStatus === 'BANNED' ? 'INACTIVE' : 'BANNED' })}
                        >
                            {user.membershipStatus === 'BANNED' ? <Unlock className="h-4 w-4 mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                            {user.membershipStatus === 'BANNED' ? 'Unban User' : 'Ban User'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Monthly Payments (Mock for now) */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <CreditCard className="h-4 w-4" />
                            Monthly Dues
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span>Dec 2025</span>
                                <Badge className="bg-green-500 font-bold h-4 text-[9px]">PAID</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>Nov 2025</span>
                                <Badge className="bg-green-500 font-bold h-4 text-[9px]">PAID</Badge>
                            </div>
                            <div className="text-center py-2 italic">
                                Total contribution: €40.00
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

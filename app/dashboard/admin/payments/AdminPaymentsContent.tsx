"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Banknote,
    Landmark,
    User as UserIcon,
    Search,
    CreditCard,
    ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface Payment {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    amount: number;
    tier: string;
    method: string;
    reference?: string;
    proofOfPayment?: string;
    proofMimeType?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
}

export function AdminPaymentsContent() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/v2/GET/admin/payments");
            const data = await res.json();
            if (res.ok) setPayments(data.payments || []);
        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (paymentId: string, status: 'COMPLETED' | 'FAILED') => {
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch(`/api/v2/PATCH/admin/payments/${paymentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || ""
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Payment marked as ${status.toLowerCase()}`);
                fetchPayments();
            } else {
                toast.error("Failed to update payment status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredPayments = payments.filter(p =>
        p.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CreditCard className="h-8 w-8 text-brand-yellow" />
                        Payment Verification Hub
                    </h2>
                    <p className="text-muted-foreground">
                        Review and verify manual membership payments (Bank/Cash).
                    </p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or reference..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="text-center py-12 animate-pulse">Scanning ledgers...</div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No pending payments found.
                    </div>
                ) : (
                    filteredPayments.map((payment) => (
                        <Card key={payment._id} className="overflow-hidden border-l-4 border-l-brand-yellow">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-full ${payment.method === 'BANK_TRANSFER' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                                            }`}>
                                            {payment.method === 'BANK_TRANSFER' ? <Landmark className="h-6 w-6" /> : <Banknote className="h-6 w-6" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg">{payment.userId?.name || 'Unknown User'}</span>
                                                <Badge variant="outline">{payment.tier}</Badge>
                                                {payment.status === 'PENDING' && (
                                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <UserIcon className="h-3 w-3" />
                                                {payment.userId?.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs font-mono bg-accent/30 p-1 px-2 rounded w-fit">
                                                    Ref: {payment.reference || 'No Reference'}
                                                </div>
                                                {payment.proofMimeType && (
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" asChild>
                                                        <a href={`/api/v2/GET/admin/payments/${payment._id}/proof`} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3 w-3" />
                                                            View Proof
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 text-center">
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Amount</div>
                                            <div className="text-2xl font-black">{payment.amount}€</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Submitted</div>
                                            <div className="text-sm font-medium">{format(new Date(payment.createdAt), 'MMM d, HH:mm')}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleAction(payment._id, 'FAILED')}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleAction(payment._id, 'COMPLETED')}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

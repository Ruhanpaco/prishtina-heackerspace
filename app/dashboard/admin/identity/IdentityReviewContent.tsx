"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Loader2, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PendingArchive {
    _id: string;
    userId: string;
    email: string;
    documentType: string;
    createdAt: string;
    forensics: {
        ipAddress: string;
        userAgent: string;
        fingerprint?: string;
    };
}

interface DecryptedDoc {
    side: string;
    data: string; // Base64
    forensics: {
        ipAddress: string;
        userAgent: string;
        fingerprint?: string;
        requestId?: string;
        timestamp: string;
    };
}

export function IdentityReviewContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [pendingArchives, setPendingArchives] = useState<PendingArchive[]>([]);
    const [selectedArchive, setSelectedArchive] = useState<PendingArchive | null>(null);
    const [decryptedDocs, setDecryptedDocs] = useState<DecryptedDoc[]>([]);
    const [reviewMetadata, setReviewMetadata] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (status === "authenticated" && (session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF')) {
            fetchPending();
        } else if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, session]);

    const fetchPending = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/v2/GET/admin/identity");
            const data = await res.json();
            if (res.ok) setPendingArchives(data.archives || []);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load pending reviews" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewArchive = async (archive: PendingArchive) => {
        setSelectedArchive(archive);
        setIsDecrypting(true);
        setDecryptedDocs([]);
        setReviewMetadata(null);
        try {
            const res = await fetch(`/api/v2/GET/admin/identity?userId=${archive.userId}`);
            const data = await res.json();
            if (res.ok) {
                setDecryptedDocs(data.documents || []);
                setReviewMetadata({
                    uploadedBy: data.uploadedBy,
                    globalForensics: data.globalForensics,
                    documentType: data.documentType
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Decryption Failed", description: error.message });
        } finally {
            setIsDecrypting(false);
        }
    };

    const handleAction = async (userId: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => {
        setIsProcessing(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch("/api/v2/PATCH/admin/identity", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || ""
                },
                body: JSON.stringify({ userId, status: action, reason })
            });

            if (res.ok) {
                toast({ title: "Success", description: `Identity ${action.toLowerCase()} finalized in Archive.` });
                setSelectedArchive(null);
                setDecryptedDocs([]);
                setReviewMetadata(null);
                fetchPending();
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading verification queue...</div>;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-brand-yellow" />
                        Identity Forensics Hub
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                        Isolated Archive // PII Forensic Inspection Layer
                    </p>
                </div>
                <Badge variant="outline" className="text-muted-foreground font-mono">
                    {pendingArchives.length} PENDING SUBMISSIONS
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Queue */}
                <Card className="border-accent/20 bg-accent/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Archival Ingestion Queue</CardTitle>
                        <CardDescription>Records identified with pending forensic verification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingArchives.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-black/20">
                                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20 text-green-500" />
                                <p className="font-medium">Archive is clean.</p>
                                <p className="text-xs">No pending forensic reviews found.</p>
                            </div>
                        ) : (
                            pendingArchives.map((archive) => (
                                <div
                                    key={archive._id}
                                    className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${selectedArchive?._id === archive._id ? 'border-brand-yellow bg-brand-yellow/10 ring-1 ring-brand-yellow/50' : 'hover:bg-accent/10 bg-black/20 border-white/5'}`}
                                    onClick={() => handleReviewArchive(archive)}
                                >
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm tracking-tight">{archive.email}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-[9px] uppercase font-bold py-0">{archive.documentType}</Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono">{archive.forensics?.ipAddress}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-brand-yellow/20 hover:text-brand-yellow">
                                        <Eye className="h-3 w-3 mr-2" />
                                        Inspect
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Secure Review Panel */}
                <Card className={`${!selectedArchive ? 'opacity-30 grayscale pointer-events-none' : ''} border-accent/20 bg-accent/5`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Secure Inspection Panel
                            {selectedArchive && <Badge variant="destructive" className="ml-auto text-[9px] animate-pulse">ENCRYPTED STREAM</Badge>}
                        </CardTitle>
                        <CardDescription>
                            Forensics bundled with PII blobs for tamper-proof auditing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isDecrypting ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-brand-yellow" />
                                <p className="text-sm font-bold font-mono animate-pulse">DECRYPTING ARCHIVE BUNDLE...</p>
                                <p className="text-[10px] text-muted-foreground font-mono">AES-256-GCM Quad-Layer Pipeline active</p>
                            </div>
                        ) : (selectedArchive && decryptedDocs.length > 0) ? (
                            <div className="space-y-6">
                                {/* Forensic Metadata Section */}
                                <div className="grid grid-cols-2 gap-3 p-4 bg-black/40 rounded-xl border border-white/10 font-mono text-[10px]">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground uppercase tracking-widest">Global Ingestion IP</p>
                                        <p className="text-brand-yellow font-bold">{selectedArchive.forensics?.ipAddress}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground uppercase tracking-widest">Submission Fingerprint</p>
                                        <p className="text-white truncate">{selectedArchive.forensics?.fingerprint || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-white/5">
                                        <p className="text-muted-foreground uppercase tracking-widest">Digital Payload ID</p>
                                        <p className="text-green-500">{decryptedDocs[0]?.forensics?.requestId || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    {decryptedDocs.map((doc, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <Badge variant="outline" className="text-[10px] font-bold border-brand-yellow/30 text-brand-yellow uppercase">
                                                    {reviewMetadata?.documentType} // {doc.side}
                                                </Badge>
                                                <span className="text-[9px] text-muted-foreground font-mono">Captured: {new Date(doc.forensics?.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                                                <img
                                                    src={`data:image/jpeg;base64,${doc.data}`}
                                                    alt="Identity Document"
                                                    className="w-full h-auto max-h-[450px] object-contain"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                    <div className="flex justify-between font-bold">
                                                        <span>ENCRYPTED_PAYLOAD_SECTION_{idx}</span>
                                                        <span className="text-red-500">PRIVATE PII DATA</span>
                                                    </div>
                                                    <div className="text-muted-foreground flex gap-2">
                                                        <span>IP: {doc.forensics?.ipAddress}</span>
                                                        <span>|</span>
                                                        <span>UA: {doc.forensics?.userAgent.substring(0, 30)}...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-white/10">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-11"
                                        onClick={() => handleAction(selectedArchive.userId, 'VERIFIED')}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                        Finalize Approval
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 font-bold h-11"
                                        onClick={() => {
                                            const reason = prompt("Enter forensic rejection reason:");
                                            if (reason) handleAction(selectedArchive.userId, 'REJECTED', reason);
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                        Reject Logic
                                    </Button>
                                </div>
                            </div>
                        ) : selectedArchive ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <AlertCircle className="h-10 w-10 text-destructive" />
                                <p className="text-sm font-bold text-destructive">INGESTION ERROR</p>
                                <p className="text-[10px] text-muted-foreground font-mono">Payload mismatch or archive decryption failed</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground italic text-sm space-y-4">
                                <ShieldAlert className="h-12 w-12 opacity-10" />
                                <p>Select a record from the queue to initiate secure stream.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

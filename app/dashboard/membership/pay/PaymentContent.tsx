"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Banknote,
    Landmark,
    Info,
    ArrowLeft,
    Send,
    ShieldCheck,
    HelpCircle,
    Building2,
    ChevronRight,
    FileUp,
    X,
    FileCheck,
    Camera,
    Sparkles,
    Check
} from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { useSession, getCsrfToken } from "next-auth/react";

type Step = "method" | "details" | "notify";

interface PaymentContentProps {
    tier: string;
    amount: string;
}

export function PaymentContent({ tier, amount }: PaymentContentProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<Step>("method");
    const [method, setMethod] = useState<"BANK_TRANSFER" | "CASH">("BANK_TRANSFER");
    const [reference, setReference] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File is too large (max 5MB)");
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileBase64(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reference) {
            toast.error("Please provide a reference number");
            return;
        }

        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch("/api/v2/POST/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || ""
                },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    tier,
                    method,
                    reference,
                    proofFile: fileBase64,
                    fileName: file?.name,
                    fileType: file?.type
                })
            });

            if (res.ok) {
                toast.success("Payment notification received. Our team will verify it shortly.");
                router.push("/dashboard");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to submit notice");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const bankDetails = {
        name: "Prishtina Hackerspace",
        iban: "XK00 1234 5678 9012 3456",
        swift: "PHACKXKP",
        reference: `${tier.substring(0, 3).toUpperCase()}-${session?.user?.name?.split(' ')[0].toUpperCase() || 'USER'}`
    };

    const steps = [
        { id: "method", title: "Method" },
        { id: "details", title: "Information" },
        { id: "notify", title: "Notification" }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-background selection:bg-brand-yellow/30 pb-20">
            {/* Header / Navigation */}
            <div className="max-w-4xl mx-auto px-6 pt-12">
                <Button variant="ghost" size="sm" asChild className="mb-8 hover:bg-accent/50 -ml-2 text-muted-foreground">
                    <Link href="/dashboard/membership/pricing" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Membership
                    </Link>
                </Button>

                <div className="flex flex-col gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">Finalize Your Access</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Unlock the full potential of <span className="text-foreground font-bold">{tier}</span> membership in three simple steps.
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-4">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2 flex-1 first:flex-initial">
                                <div className={cn(
                                    "flex items-center justify-center shrink-0 w-8 h-8 rounded-full border-2 text-xs font-bold transition-all duration-500",
                                    currentStep === s.id ? "bg-brand-yellow border-brand-yellow text-brand-dark" :
                                        steps.findIndex(x => x.id === currentStep) > i ? "bg-brand-yellow/20 border-brand-yellow/30 text-brand-yellow" :
                                            "bg-muted border-muted text-muted-foreground"
                                )}>
                                    {steps.findIndex(x => x.id === currentStep) > i ? <Check className="h-4 w-4" /> : i + 1}
                                </div>
                                <span className={cn(
                                    "text-xs font-black uppercase tracking-widest hidden sm:inline",
                                    currentStep === s.id ? "text-foreground" : "text-muted-foreground/60"
                                )}>
                                    {s.title}
                                </span>
                                {i < steps.length - 1 && <div className="h-[2px] bg-muted flex-1 mx-2" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Experience */}
            <div className="max-w-xl mx-auto px-6">
                <AnimatePresence mode="wait">
                    {currentStep === "method" && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black">How will you pay?</h2>
                                <p className="text-muted-foreground">Select your preferred payment channel.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <button
                                    onClick={() => setMethod("BANK_TRANSFER")}
                                    className={cn(
                                        "group relative flex items-center p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-left overflow-hidden",
                                        method === "BANK_TRANSFER" ? "border-brand-yellow bg-brand-yellow/5" : "border-muted hover:border-brand-yellow/30 hover:bg-muted/30"
                                    )}
                                >
                                    <div className={cn(
                                        "p-4 rounded-2xl mr-6 transition-all",
                                        method === "BANK_TRANSFER" ? "bg-brand-yellow text-brand-dark" : "bg-muted text-muted-foreground group-hover:bg-brand-yellow/10 group-hover:text-brand-yellow"
                                    )}>
                                        <Landmark className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">Bank Transfer</h3>
                                        <p className="text-sm text-muted-foreground">Standard wire transfer from any bank.</p>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        method === "BANK_TRANSFER" ? "border-brand-yellow bg-brand-yellow" : "border-muted"
                                    )}>
                                        {method === "BANK_TRANSFER" && <Check className="h-4 w-4 text-brand-dark" />}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod("CASH")}
                                    className={cn(
                                        "group relative flex items-center p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-left overflow-hidden",
                                        method === "CASH" ? "border-green-500 bg-green-500/5" : "border-muted hover:border-green-500/30 hover:bg-muted/30"
                                    )}
                                >
                                    <div className={cn(
                                        "p-4 rounded-2xl mr-6 transition-all",
                                        method === "CASH" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground group-hover:bg-green-500/10 group-hover:text-green-500"
                                    )}>
                                        <Banknote className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">Cash Drop</h3>
                                        <p className="text-sm text-muted-foreground">In-person payment at the Lab donation box.</p>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        method === "CASH" ? "border-green-500 bg-green-500" : "border-muted"
                                    )}>
                                        {method === "CASH" && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                </button>
                            </div>

                            <Button
                                className="w-full h-16 rounded-[2rem] text-lg font-black bg-foreground text-background hover:bg-foreground/90 transition-all"
                                onClick={() => setCurrentStep("details")}
                            >
                                Continue to Step 2
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    )}

                    {currentStep === "details" && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black">Payment Instructions</h2>
                                <p className="text-muted-foreground">Follow these details carefully.</p>
                            </div>

                            {method === "BANK_TRANSFER" ? (
                                <div className="space-y-4">
                                    {[
                                        { label: "Beneficiary", value: bankDetails.name },
                                        { label: "IBAN", value: bankDetails.iban },
                                        { label: "SWIFT/BIC", value: bankDetails.swift },
                                        { label: "Reference ID", value: bankDetails.reference, highlight: true }
                                    ].map((item, i) => (
                                        <div key={i} className="group relative bg-muted/40 p-6 rounded-3xl border border-transparent hover:border-brand-yellow/20 transition-all">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                                            <div className="flex items-center justify-between gap-4">
                                                <p className={cn(
                                                    "font-mono font-medium text-lg truncate",
                                                    item.highlight && "text-brand-yellow font-black"
                                                )}>
                                                    {item.value}
                                                </p>
                                                <CopyButton value={item.value} variant="ghost" className="shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-muted/30 rounded-2xl flex items-start gap-3">
                                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Transfer <span className="text-foreground font-bold">{amount}€</span>. Verification normally takes <span className="text-foreground font-bold">24-48 hours</span> once the funds appear in our system.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-muted/40 p-8 rounded-[2.5rem] space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-brand-yellow/10 p-3 rounded-2xl">
                                                <Building2 className="h-6 w-6 text-brand-yellow" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Locate the Lab</h4>
                                                <p className="text-sm text-muted-foreground">Rrustem Statovci 11, Prishtina</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pl-4 border-l-2 border-brand-yellow/20">
                                            <p className="text-sm flex gap-3"><span className="font-black text-brand-yellow">01.</span> Visit during core hours (10:00–18:00)</p>
                                            <p className="text-sm flex gap-3"><span className="font-black text-brand-yellow">02.</span> Drop cash in the secure Donation Box</p>
                                            <p className="text-sm flex gap-3"><span className="font-black text-brand-yellow">03.</span> Note the time/date for your notice</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-2xl flex items-start gap-3">
                                        <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Cash boxes are audited regularly. Your account status will update once the deposit is confirmed by staff.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    className="h-16 rounded-[2rem] text-lg font-bold"
                                    onClick={() => setCurrentStep("method")}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="h-16 rounded-[2rem] text-lg font-black bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl shadow-foreground/10"
                                    onClick={() => setCurrentStep("notify")}
                                >
                                    Last Step
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "notify" && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black">Official Notification</h2>
                                <p className="text-muted-foreground">Confirm your payment for verification.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Reference / Receipt Number</Label>
                                        <Input
                                            placeholder="e.g. IBAN-123456 or Receipt-001"
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                            className="h-16 rounded-[1.5rem] px-6 text-lg border-2 focus-visible:ring-brand-yellow focus-visible:border-brand-yellow font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Proof of Payment (Photo/PDF)</Label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "relative group h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                                                file ? "border-green-500/50 bg-green-500/5" : "border-muted hover:border-brand-yellow/50 hover:bg-muted/30"
                                            )}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                            />

                                            <AnimatePresence mode="wait">
                                                {file ? (
                                                    <motion.div
                                                        key="file-ready"
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="flex flex-col items-center text-center px-4"
                                                    >
                                                        <div className="bg-green-500 text-white p-3 rounded-2xl mb-3 shadow-lg shadow-green-500/20">
                                                            <FileCheck className="h-8 w-8" />
                                                        </div>
                                                        <p className="font-bold text-sm truncate max-w-[250px]">{file.name}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                                                            {(file.size / 1024).toFixed(0)} KB • Click to replace
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-4 right-4 text-muted-foreground hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFile(null);
                                                                setFileBase64(null);
                                                            }}
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="empty"
                                                        className="flex flex-col items-center text-muted-foreground"
                                                    >
                                                        <div className="p-4 rounded-2xl bg-muted/50 mb-4 group-hover:scale-110 transition-transform">
                                                            <FileUp className="h-8 w-8" />
                                                        </div>
                                                        <p className="text-sm font-medium">Select or drag proof document</p>
                                                        <p className="text-[10px] mt-1 opacity-60">IMAGE or PDF up to 5MB</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-brand-yellow/10 border border-brand-yellow/20 flex gap-4">
                                    <Sparkles className="h-6 w-6 text-brand-yellow shrink-0 mt-1" />
                                    <p className="text-sm leading-relaxed">
                                        Our forensic auditors will verify the 256-bit encrypted payload. Your data is stored securely and only accessible by authorized staff.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-16 rounded-[2rem] text-lg font-bold"
                                        onClick={() => setCurrentStep("details")}
                                        disabled={isLoading}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-16 rounded-[2rem] text-lg font-black bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 transition-all shadow-xl shadow-brand-yellow/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Encrypting..." : "Submit Notice"}
                                        {!isLoading && <Send className="ml-2 h-5 w-5" />}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Help */}
                <div className="mt-16 flex items-center justify-center gap-6 text-muted-foreground/60">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Help Center</span>
                    </div>
                    <div className="h-4 w-[1px] bg-muted" />
                    <div className="text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors">Discord Support</div>
                </div>
            </div>
        </div>
    );
}

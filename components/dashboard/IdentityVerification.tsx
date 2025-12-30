"use client";

import { useState } from "react";
import { getCsrfToken } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Upload, Loader2, CreditCard, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface IdentityVerificationProps {
    status: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    onSuccess?: () => void;
}

export function IdentityVerification({ status, onSuccess }: IdentityVerificationProps) {
    const [idType, setIdType] = useState<'ID_CARD' | 'PASSPORT'>('ID_CARD');
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0] || null;
        if (side === 'front') setFrontFile(file);
        else setBackFile(file);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUpload = async () => {
        if (!frontFile || (idType === 'ID_CARD' && !backFile)) {
            toast({
                variant: "destructive",
                title: "Missing Files",
                description: "Please upload the required identification documents."
            });
            return;
        }

        setIsUploading(true);
        try {
            const filesPayload = [];

            filesPayload.push({
                side: idType === 'ID_CARD' ? 'FRONT' : 'FULL',
                data: await fileToBase64(frontFile),
                name: frontFile.name
            });

            if (idType === 'ID_CARD' && backFile) {
                filesPayload.push({
                    side: 'BACK',
                    data: await fileToBase64(backFile),
                    name: backFile.name
                });
            }

            const csrfToken = await getCsrfToken();
            const response = await fetch('/api/v2/POST/auth/identity/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ""
                },
                body: JSON.stringify({
                    type: idType,
                    files: filesPayload
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Your documents have been uploaded for verification."
                });
                onSuccess?.();
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (status === 'VERIFIED') {
        return (
            <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="flex flex-row items-center space-x-4">
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <ShieldCheck className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <CardTitle>Identity Verified</CardTitle>
                        <CardDescription>Your identity has been successfully confirmed.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (status === 'PENDING') {
        return (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader className="flex flex-row items-center space-x-4">
                    <div className="p-2 bg-yellow-500/10 rounded-full">
                        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                    </div>
                    <div>
                        <CardTitle>Verification Pending</CardTitle>
                        <CardDescription>Our team is currently reviewing your documents.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                    Identity Verification
                </CardTitle>
                <CardDescription>
                    Please upload a government-issued ID to activate your membership and RFID access.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex space-x-4">
                    <Button
                        variant={idType === 'ID_CARD' ? "default" : "outline"}
                        onClick={() => setIdType('ID_CARD')}
                        className="flex-1"
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        ID Card
                    </Button>
                    <Button
                        variant={idType === 'PASSPORT' ? "default" : "outline"}
                        onClick={() => setIdType('PASSPORT')}
                        className="flex-1"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Passport
                    </Button>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {idType === 'ID_CARD' ? "Front Side" : "Passport Information Page"}
                        </label>
                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors relative cursor-pointer group">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'front')}
                            />
                            {frontFile ? (
                                <span className="text-sm font-medium text-primary">{frontFile.name}</span>
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {idType === 'ID_CARD' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Back Side</label>
                            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors relative cursor-pointer group">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'back')}
                                />
                                {backFile ? (
                                    <span className="text-sm font-medium text-primary">{backFile.name}</span>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {status === 'REJECTED' && (
                    <div className="flex items-start space-x-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>Previous upload was rejected. Please ensure the photos are clear and legible.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Encrypting & Uploading...
                        </>
                    ) : (
                        "Submit for Verification"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}

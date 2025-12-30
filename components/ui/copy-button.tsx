"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CopyButtonProps {
    value: string;
    className?: string;
    variant?: "ghost" | "outline" | "default" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    showLabel?: boolean;
}

export function CopyButton({
    value,
    className,
    variant = "ghost",
    size = "icon",
    showLabel = false
}: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    return (
        <Button
            size={size}
            variant={variant}
            className={cn("h-8 w-8", showLabel && "h-auto w-auto px-2 py-1 gap-2", className)}
            onClick={copy}
            type="button"
        >
            {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
            {showLabel && (
                <span className="text-xs">{isCopied ? "Copied" : "Copy"}</span>
            )}
        </Button>
    );
}

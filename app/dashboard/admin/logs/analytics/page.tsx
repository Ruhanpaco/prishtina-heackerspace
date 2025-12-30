import { Suspense } from "react";
import { SecurityIntelligenceContent } from "./SecurityIntelligenceContent";
import { Loader2 } from "lucide-react";

export default function SecurityIntelligencePage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-brand-yellow" />
                    <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-xs">Decrypting Security Patterns...</p>
                </div>
            </div>
        }>
            <SecurityIntelligenceContent />
        </Suspense>
    );
}

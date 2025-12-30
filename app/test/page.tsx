export default function TestPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
            <h1 className="text-4xl font-bold mb-4">Development Test Page</h1>
            <p className="text-lg text-muted-foreground">
                If this page loads quickly and hot-reloads without context rebuilding, the Fast Refresh issue is resolved.
            </p>
            <div className="mt-8 p-4 border rounded-lg bg-card">
                <p>Status: Working</p>
            </div>
        </div>
    );
}

export function isModuleEnabled(moduleName: string): boolean {
    const value = process.env[moduleName];
    // Default to true if not specified
    if (value === undefined) return true;
    return value === "true";
}

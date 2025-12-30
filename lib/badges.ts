export interface BadgeDefinition {
    id: string;
    label: string;
    description: string;
    icon: string; // Lucide icon name
    color: string;
}

export const AVAILABLE_BADGES: BadgeDefinition[] = [
    {
        id: "founder",
        label: "Founder",
        description: "Early member of PRHS",
        icon: "ShieldCheck",
        color: "text-blue-500"
    },
    {
        id: "innovator",
        label: "Innovator",
        description: "Successfully completed their 1st project",
        icon: "Zap",
        color: "text-yellow-500"
    },
    {
        id: "contributor",
        label: "Contributor",
        description: "Active contributor to the space",
        icon: "Code",
        color: "text-green-500"
    },
    {
        id: "mentor",
        label: "Mentor",
        description: "Helped other members grow",
        icon: "Heart",
        color: "text-red-500"
    },
    {
        id: "elite",
        label: "Elite",
        description: "Top tier membership level achievement",
        icon: "Trophy",
        color: "text-purple-500"
    }
];

export function getBadgeById(id: string) {
    return AVAILABLE_BADGES.find(b => b.id === id);
}

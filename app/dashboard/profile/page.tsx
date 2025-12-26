import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Github,
    Linkedin,
    Twitter,
    Link as LinkIcon,
    Instagram,
    Facebook,
    MapPin,
    Mail,
    Phone,
    User as UserIcon,
    Star,
    BarChart,
    Folder,
    Code,
    Pencil,
    Settings,
    Calendar,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return <div>User not found</div>;

    // Derived or Default Data to match design
    const fullName = user.name || "Unknown User";
    const role = user.role || "Member";
    const bio = user.bio || "No biography provided yet.";
    const location = user.location || "Prishtina, Kosovo";
    const website = user.website || "https://flossk.org";
    const phone = user.phoneNumber || "+383 4X XXX XXX";
    const dateJoined = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const skills = user.skills && user.skills.length > 0 ? user.skills : ['Community', 'Tech', 'Learning'];

    // Mock Projects for UI matching (Sakai has complex projects)
    const projects = [
        {
            name: "Smart Home Auto (Mock)",
            description: "IoT based home automation system using Arduino.",
            status: "In Progress",
            role: "Lead",
            progress: 65,
            contributors: 4
        },
        {
            name: "3D Printer Upgrade (Mock)",
            description: "Improving cooling systems for Prusa printers.",
            status: "Completed",
            role: "Contributor",
            progress: 100,
            contributors: 2
        }
    ];

    // Combine real user projects if available (as simple strings) with mocks or structures
    // For now, we'll just display the mocks to show the design structure

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Header Card */}
            <Card className="overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="relative inline-block">
                                <Avatar className="w-48 h-48 sm:w-56 sm:h-56 border-4 border-background shadow-xl">
                                    <AvatarImage src={user.image} alt={fullName} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-bold bg-muted">{fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-4 right-4">
                                    <span className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background ${user.membershipStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} title={user.membershipStatus}>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center lg:text-left space-y-6 pt-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-1">{fullName}</h1>
                                {user.title && <p className="text-lg font-medium text-primary mb-1">{user.title}</p>}
                                <p className="text-muted-foreground mb-4">{user.email}</p>

                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    {(user.links || []).map((link: any) => {
                                        const platformMap: Record<string, any> = {
                                            github: Github,
                                            twitter: Twitter,
                                            linkedin: Linkedin,
                                            instagram: Instagram,
                                            facebook: Facebook,
                                            website: LinkIcon
                                        };
                                        const Icon = platformMap[link.platform] || LinkIcon;

                                        return (
                                            <Link key={link.id} href={link.url} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                                <Icon className="w-6 h-6" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined: <span className="font-semibold text-foreground">{dateJoined}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="w-4 h-4" />
                                    <span>Role: <span className="font-semibold text-foreground">{role}</span></span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Pencil className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                                <Button variant="secondary" className="gap-2">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Biography */}
                <Card className="h-full">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <UserIcon className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Biography</h3>
                        </div>
                        <Separator />
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            {bio}
                        </p>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="h-full">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Mail className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Contact</h3>
                        </div>
                        <Separator />
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <span>{phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <span>{location}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                                <a href={website} target="_blank" className="hover:underline text-blue-500 truncate">{website}</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="h-full">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Star className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Skills</h3>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="px-3 py-1 bg-secondary text-secondary-foreground">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <Card className="h-full">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <BarChart className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Statistics</h3>
                        </div>
                        <Separator />
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Projects</p>
                                    <p className="text-2xl font-bold">{projects.length + (user.projects?.length || 0)}</p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Contributions</p>
                                    <p className="text-2xl font-bold">156</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Projects */}
            <Card>
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-2">
                        <Folder className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-semibold">My Projects</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, i) => (
                            <div key={i} className="border rounded-xl p-5 hover:shadow-md transition-all space-y-4">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-bold text-lg">{project.name}</h4>
                                    <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>{project.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <UserIcon className="w-3 h-3" />
                                    <span>{project.role}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-bold">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2" />
                                </div>

                                <Separator />

                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[...Array(project.contributors)].map((_, idx) => (
                                            <Avatar key={idx} className="w-8 h-8 border-2 border-background">
                                                <AvatarFallback className="text-[10px] bg-muted-foreground/20">U{idx}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

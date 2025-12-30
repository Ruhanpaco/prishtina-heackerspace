import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import Project from "@/models/Project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    User as UserIcon,
    Folder,
    Settings,
    Activity,
    ExternalLink,
    ShieldCheck,
    Trophy,
    Zap,
    HelpCircle
} from "lucide-react";
import Link from "next/link";
import { getBadgeById } from "@/lib/badges";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();

    // Fetch user and their projects
    const [user, projects] = await Promise.all([
        User.findById(session.user.id),
        Project.find({
            $or: [
                { owner: session.user.id },
                { members: session.user.id }
            ]
        }).sort({ updatedAt: -1 })
    ]);

    if (!user) return <div className="p-4 text-center">User not found</div>;

    // Derived Data
    const fullName = user.name || "PRHS Member";
    const roleCapitalized = user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "User";
    const skills = user.skills && user.skills.length > 0 ? user.skills : [];

    // Real Badges from DB
    const userBadges = (user.badges || []).map((id: string) => getBadgeById(id)).filter(Boolean);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header Section with Banner & Overlapping Avatar */}
            <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
                {/* Banner Area - Geometric Pattern */}
                <div className="h-48 sm:h-64 relative overflow-hidden bg-brand-yellow/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/20 via-transparent to-purple-500/20 opacity-40"></div>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="absolute top-10 right-10 w-32 h-32 bg-brand-yellow/20 rounded-full blur-[60px] animate-pulse"></div>
                    <div className="absolute -bottom-10 left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]"></div>
                </div>

                <div className="px-6 sm:px-10 pb-10 relative">
                    <div className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                            <div className="relative group">
                                <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-brand-yellow via-brand-yellow/20 to-zinc-900 border border-white/10 shadow-2xl">
                                    <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-[6px] border-zinc-900 shadow-xl overflow-hidden">
                                        <AvatarImage src={user.image} alt={fullName} className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <AvatarFallback className="text-4xl font-black bg-zinc-800 text-brand-yellow">
                                            {fullName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 border-[3px] border-zinc-900 shadow-lg"></div>
                            </div>

                            <div className="space-y-2 pb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">{fullName}</h1>
                                    {user.identificationStatus === 'VERIFIED' && (
                                        <div className="p-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-lg font-medium text-zinc-400 flex items-center gap-2">
                                    {user.title || "Elite Developer"}
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow"></span>
                                    <span className="text-brand-yellow font-bold uppercase tracking-widest text-xs">{roleCapitalized}</span>
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.slice(0, 3).map(skill => (
                                        <Badge key={skill} variant="secondary" className="bg-white/5 text-zinc-400 border-white/5">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {skills.length > 3 && <Badge variant="outline" className="text-[10px] text-zinc-500">+{skills.length - 3}</Badge>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold px-8 rounded-2xl h-12 shadow-lg flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Send Message
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-white/5 bg-white/5" asChild>
                                <Link href="/dashboard/settings">
                                    <Settings className="w-5 h-5 text-zinc-400" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden border-l-4 border-l-brand-yellow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                                <UserIcon className="w-5 h-5 text-brand-yellow" />
                                About Me
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-zinc-400 leading-relaxed text-md">
                                {user.bio || "High-performance systems architect crafting the future of technology at Prishtina Hackerspace."}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Activity className="w-6 h-6 text-brand-yellow" />
                                Recent Projects
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.length > 0 ? (
                                projects.slice(0, 4).map((project) => (
                                    <Card key={project._id.toString()} className="group rounded-3xl border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60 transition-all duration-500 relative overflow-hidden border-l-4 border-l-transparent hover:border-l-brand-yellow">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge className={cn(
                                                        "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                                                        project.status === 'COMPLETED' ? "bg-green-500/10 text-green-400" : "bg-brand-yellow/10 text-brand-yellow"
                                                    )}>
                                                        {project.status.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-[10px] text-zinc-500 font-bold">{new Date(project.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-white group-hover:text-brand-yellow transition-colors truncate">{project.name}</h4>
                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed h-8">
                                                    {project.description}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 tracking-tighter">
                                                        <span>Progress</span>
                                                        <span className="text-brand-yellow">{project.progress}%</span>
                                                    </div>
                                                    <Progress value={project.progress} className="h-1.5 rounded-full bg-white/5" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex -space-x-2">
                                                        {(project.members || []).slice(0, 3).map((m: any, idx: number) => (
                                                            <Avatar key={idx} className="w-7 h-7 ring-2 ring-zinc-900 border border-white/10">
                                                                <AvatarFallback className="text-[9px] font-black bg-zinc-800 text-zinc-400">U</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-zinc-600 transition-colors group-hover:text-brand-yellow" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center space-y-4 rounded-3xl border border-dashed border-white/5 bg-zinc-900/20 backdrop-blur-sm">
                                    <Folder className="w-12 h-12 text-zinc-700 mx-auto" />
                                    <p className="font-black text-white text-lg tracking-tight">No active missions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Location</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <div className="p-2 rounded-xl bg-zinc-800 text-brand-yellow">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{user.location || "Prishtina, Kosovo"}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Base HQ</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Connect</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                            {(user.links || []).map((link: any) => {
                                const platformMap: Record<string, any> = {
                                    github: Github,
                                    twitter: Twitter,
                                    linkedin: Linkedin,
                                    facebook: Facebook,
                                    instagram: Instagram
                                };
                                const PlatformIcon = platformMap[link.platform] || LinkIcon;
                                return (
                                    <Link key={link.id} href={link.url} target="_blank" className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-brand-yellow/10 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <PlatformIcon className="w-4 h-4 text-zinc-500 group-hover:text-brand-yellow" />
                                            <span className="text-xs font-bold text-zinc-400 capitalize">{link.platform}</span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-zinc-600 transition-opacity opacity-0 group-hover:opacity-100" />
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500 tracking-tighter">Achievements</CardTitle>
                            <Badge className="bg-brand-yellow/10 text-brand-yellow text-[10px] font-black border-none">{userBadges.length}</Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                                {userBadges.length > 0 ? (
                                    userBadges.slice(0, 4).map((badge: any, idx: number) => {
                                        const BadgeIcon = (LucideIcons as any)[badge.icon] || HelpCircle;
                                        return (
                                            <div key={idx} className="p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 bg-zinc-950/40 group hover:border-brand-yellow/20 transition-all" title={badge.description}>
                                                <BadgeIcon className={cn("w-5 h-5", badge.color)} />
                                                <span className="text-[8px] font-black text-center text-zinc-400 uppercase tracking-tighter line-clamp-1">{badge.label}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-2 py-6 text-center border border-dashed border-white/10 rounded-2xl">
                                        <Trophy className="w-5 h-5 text-zinc-800 mx-auto" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-white/5 bg-gradient-to-br from-brand-yellow/10 to-zinc-900/40 backdrop-blur-md p-6 relative overflow-hidden group border-brand-yellow/20">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rank Progress</p>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-white leading-none tracking-tight">{user.points || 0} <span className="text-brand-yellow text-xs font-black">XP</span></p>
                            </div>
                            <Progress value={Math.min((user.points || 0) % 100, 100)} className="h-1.5 w-full bg-zinc-950" />
                            <div className="flex items-center gap-2 text-[10px] font-black text-brand-yellow uppercase tracking-widest">
                                <Zap className="w-3 h-3" />
                                Level {Math.floor((user.points || 0) / 100) + 1} Architect
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

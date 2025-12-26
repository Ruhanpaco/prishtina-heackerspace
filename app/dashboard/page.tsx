import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Rocket, Code } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();

    // In a real app, aggregation pipeline to sort by points or project count
    // const topContributors = await User.find({}).sort({ points: -1 }).limit(10);

    // Mock Data for "Leaderboard of Contributors"
    const leaderboard = [
        { rank: 1, name: "Amy Elsner", points: 1250, role: "Board Member", projects: 12, image: "https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" },
        { rank: 2, name: "Bernardo Dominic", points: 980, role: "Member", projects: 8, image: "https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png" },
        { rank: 3, name: "Anna Fali", points: 850, role: "Member", projects: 15, image: "https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png" },
        { rank: 4, name: "Asiya Javayant", points: 720, role: "Contributor", projects: 4, image: "https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" },
        { rank: 5, name: "Xuxue Feng", points: 650, role: "Member", projects: 6, image: "https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-4xl font-black tracking-tight flex items-center justify-center gap-3">
                    <Trophy className="h-10 w-10 text-brand-yellow" />
                    Community Leaderboard
                </h1>
                <p className="text-muted-foreground text-lg">Top contributors shaping the future of hackerspace.</p>
            </div>

            <div className="grid gap-6">
                {/* Top 3 Podium (Visual) - Optional fanciness */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 items-end">
                    {/* Rank 2 */}
                    <Card className="order-2 md:order-1 bg-gradient-to-t from-gray-100 to-white dark:from-background dark:to-accent/10 border-none shadow-md transform hover:-translate-y-1 transition-transform">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto border-4 border-gray-300 rounded-full p-1 mb-2 w-fit">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={leaderboard[1].image} />
                                    <AvatarFallback>2</AvatarFallback>
                                </Avatar>
                            </div>
                            <Badge variant="secondary" className="mx-auto w-fit mb-1 bg-gray-200 text-gray-700">Rank #2</Badge>
                            <CardTitle>{leaderboard[1].name}</CardTitle>
                            <p className="text-brand-yellow font-bold text-xl">{leaderboard[1].points} XP</p>
                        </CardHeader>
                    </Card>

                    {/* Rank 1 */}
                    <Card className="order-1 md:order-2 bg-gradient-to-t from-brand-yellow/10 to-white dark:from-background dark:to-brand-yellow/10 border-brand-yellow shadow-lg transform scale-110 z-10">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto">
                                <Trophy className="w-8 h-8 text-brand-yellow mx-auto mb-2" />
                            </div>
                            <div className="mx-auto border-4 border-brand-yellow rounded-full p-1 mb-2 w-fit">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={leaderboard[0].image} />
                                    <AvatarFallback>1</AvatarFallback>
                                </Avatar>
                            </div>
                            <Badge className="mx-auto w-fit mb-1 bg-brand-yellow text-brand-dark hover:bg-brand-yellow">Rank #1</Badge>
                            <CardTitle className="text-xl">{leaderboard[0].name}</CardTitle>
                            <p className="text-brand-dark dark:text-brand-yellow font-black text-3xl">{leaderboard[0].points} XP</p>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-muted-foreground">
                            Leading with {leaderboard[0].projects} active projects!
                        </CardContent>
                    </Card>

                    {/* Rank 3 */}
                    <Card className="order-3 bg-gradient-to-t from-orange-50 to-white dark:from-background dark:to-orange-900/10 border-none shadow-md transform hover:-translate-y-1 transition-transform">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto border-4 border-orange-200 rounded-full p-1 mb-2 w-fit">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={leaderboard[2].image} />
                                    <AvatarFallback>3</AvatarFallback>
                                </Avatar>
                            </div>
                            <Badge variant="secondary" className="mx-auto w-fit mb-1 bg-orange-100 text-orange-800">Rank #3</Badge>
                            <CardTitle>{leaderboard[2].name}</CardTitle>
                            <p className="text-brand-yellow font-bold text-xl">{leaderboard[2].points} XP</p>
                        </CardHeader>
                    </Card>
                </div>

                {/* Rest of the List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Contributors</CardTitle>
                        <CardDescription>Rankings based on project contributions and community activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {leaderboard.slice(3).map((user) => (
                                <div key={user.rank} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-xl text-muted-foreground w-6 text-center">{user.rank}</span>
                                        <Avatar>
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-[10px] h-5">{user.role}</Badge>
                                                <span>• {user.projects} Projects</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg group-hover:text-brand-yellow transition-colors">
                                        {user.points} XP
                                    </div>
                                </div>
                            ))}
                            {/* Mock Rows to fill space */}
                            <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xl text-muted-foreground w-6 text-center">6</span>
                                    <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-semibold">John Doe</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] h-5">User</Badge>
                                            <span>• 2 Projects</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-lg text-muted-foreground">500 XP</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

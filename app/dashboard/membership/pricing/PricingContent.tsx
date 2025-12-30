"use client";

import { Check, Zap, Crown, User, ShieldCheck, HelpCircle, Star, Sparkles, Building2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Enthusiast",
        price: "20",
        description: "Perfect for hobbyists and students who need a productive space.",
        icon: User,
        color: "blue",
        features: [
            "24/7 Access to Space",
            "High-speed Fiber WiFi",
            "Unlimited Coffee & Tea",
            "Basic Workshop Access"
        ],
        badge: "Most Popular",
        tierId: "ENTHUSIAST",
        highlight: false
    },
    {
        name: "Pro Hack",
        price: "50",
        description: "For professionals and makers who need their own dedicated workspace.",
        icon: Zap,
        color: "yellow",
        features: [
            "Everything in Enthusiast",
            "Dedicated Personal Desk",
            "Storage Locker Access",
            "Priority Lab Equipment Use"
        ],
        badge: "Best Value",
        tierId: "PRO",
        highlight: true
    },
    {
        name: "Elite Contributor",
        price: "100",
        description: "For heavy lifters and core members shaping the future of the space.",
        icon: Crown,
        color: "purple",
        features: [
            "Everything in Pro Hack",
            "Server Rack Space (2U)",
            "Voting Rights in Assembly",
            "Host Unlimited Guests"
        ],
        badge: "Premium",
        tierId: "ELITE",
        highlight: false
    }
];

const faqs = [
    {
        q: "How does payment verification work?",
        a: "Since we accept manual payments (Bank Transfer/Cash), an admin needs to verify the receipt. This usually takes 1-2 business days for bank transfers and is instant for cash drops if a staff member is present."
    },
    {
        q: "Can I upgrade my tier later?",
        a: "Absolutely! You can upgrade at any time. The remaining balance of your current month will be credited towards your new tier."
    },
    {
        q: "What if I can't afford the membership?",
        a: "We believe in radical inclusion. If you're a student or in a tough spot, come talk to us. We have 'Sponsorship' programs funded by Elite members."
    },
    {
        q: "Is there a long-term commitment?",
        a: "No. All memberships are month-to-month. You can cancel or pause your membership anytime from your settings."
    }
];

const comparisonFeatures = [
    { name: "24/7 Space Access", enthusiast: true, pro: true, elite: true },
    { name: "Gigabit Fiber WiFi", enthusiast: true, pro: true, elite: true },
    { name: "Workshop Tools", enthusiast: "Basic", pro: "Priority", elite: "Priority+" },
    { name: "Dedicated Desk", enthusiast: false, pro: true, elite: true },
    { name: "Storage Locker", enthusiast: false, pro: true, elite: true },
    { name: "Server Colocation", enthusiast: false, pro: false, elite: "2U Included" },
    { name: "Voting Rights", enthusiast: false, pro: false, elite: true },
    { name: "Guest Policy", enthusiast: "Limited", pro: "Standard", elite: "Unlimited" },
];

export function PricingContent() {
    return (
        <div className="flex-1 relative overflow-hidden bg-background">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-yellow/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-[20%] w-[50%] h-[30%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="mb-4 py-1 px-4 border-brand-yellow/30 text-brand-yellow bg-brand-yellow/5">
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                            Support Your Local Hackerspace
                        </Badge>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Build the Future <br />
                            <span className="text-brand-yellow">With Us.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Prishtina Hackerspace is a community-funded lab. Your membership keeps the lights on, the servers humming, and the coffee brewing.
                        </p>
                    </motion.div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-24 lg:mb-32">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                        >
                            <Card className={cn(
                                "relative flex flex-col h-full border-2 transition-all duration-500 group overflow-hidden",
                                tier.highlight ? "border-brand-yellow shadow-2xl shadow-brand-yellow/10 scale-105 z-20" : "hover:border-foreground/20 hover:shadow-xl",
                                tier.color === 'purple' && "hover:shadow-purple-500/5",
                                tier.color === 'blue' && "hover:shadow-blue-500/5"
                            )}>
                                {tier.highlight && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-brand-yellow text-brand-dark text-[10px] font-black uppercase px-3 py-1 rotate-45 translate-x-3 translate-y-1 w-24 text-center shadow-lg">
                                            Popular
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="text-center pt-10 pb-6">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className={cn(
                                            "mx-auto p-4 rounded-2xl mb-6 w-fit shadow-inner transition-colors",
                                            tier.color === 'yellow' ? 'bg-brand-yellow/10 text-brand-yellow' :
                                                tier.color === 'purple' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                                        )}
                                    >
                                        <tier.icon className="h-10 w-10" />
                                    </motion.div>
                                    <CardTitle className="text-3xl font-black mb-2">{tier.name}</CardTitle>
                                    <CardDescription className="text-sm px-4">{tier.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col p-8 pt-0">
                                    <div className="flex items-center justify-center gap-1 mb-8">
                                        <span className="text-6xl font-black tracking-tighter">{tier.price}€</span>
                                        <div className="flex flex-col text-left">
                                            <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">EUR</span>
                                            <span className="text-muted-foreground text-xs">/month</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">What's included</p>
                                        <ul className="space-y-4">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-3 text-sm">
                                                    <div className={cn(
                                                        "rounded-full p-0.5 shrink-0",
                                                        tier.highlight ? "bg-brand-yellow/20 text-brand-yellow" : "bg-primary/10 text-primary"
                                                    )}>
                                                        <Check className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-8 pt-0">
                                    <Button
                                        className={cn(
                                            "w-full h-14 text-lg font-black transition-all rounded-xl",
                                            tier.highlight
                                                ? "bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 hover:scale-[1.02] shadow-lg shadow-brand-yellow/20"
                                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        )}
                                        asChild
                                    >
                                        <Link href={`/dashboard/membership/pay?tier=${tier.tierId}&amount=${tier.price}`}>
                                            Join as {tier.name}
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="mb-32">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                            <Terminal className="h-8 w-8 text-brand-yellow" />
                            Detailed Breakdown
                        </h2>
                        <p className="text-muted-foreground">Compare features across all tiers to find the best fit for your projects.</p>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border bg-card/50 backdrop-blur-sm shadow-xl">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="p-6 font-bold text-sm uppercase tracking-wider">Feature</th>
                                    <th className="p-6 font-bold text-sm uppercase tracking-wider text-center">Enthusiast</th>
                                    <th className="p-6 font-bold text-sm uppercase tracking-wider text-center bg-brand-yellow/5">Pro Hack</th>
                                    <th className="p-6 font-bold text-sm uppercase tracking-wider text-center">Elite</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {comparisonFeatures.map((f, i) => (
                                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-6 font-medium text-sm">{f.name}</td>
                                        <td className="p-6 text-center">
                                            {typeof f.enthusiast === 'boolean' ? (
                                                f.enthusiast ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <span className="text-muted-foreground/30">—</span>
                                            ) : (
                                                <span className="text-xs font-bold">{f.enthusiast}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center bg-brand-yellow/5">
                                            {typeof f.pro === 'boolean' ? (
                                                f.pro ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <span className="text-muted-foreground/30">—</span>
                                            ) : (
                                                <span className="text-xs font-bold">{f.pro}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            {typeof f.elite === 'boolean' ? (
                                                f.elite ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <span className="text-muted-foreground/30">—</span>
                                            ) : (
                                                <span className="text-xs font-bold">{f.elite}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-24 lg:mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                            <HelpCircle className="h-8 w-8 text-brand-yellow" />
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground">Everything you need to know about joining our hackerspace.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-2xl border bg-card hover:border-brand-yellow/30 transition-all"
                            >
                                <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                                    <span className="bg-brand-yellow/20 text-brand-yellow rounded-lg p-1 mt-0.5 text-xs">Q</span>
                                    {faq.q}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed pl-8">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Verification Reminder */}
                <div className="mt-16 p-10 rounded-[2.5rem] border-2 border-dashed border-brand-yellow/20 flex flex-col md:flex-row items-center justify-between gap-10 bg-brand-yellow/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck className="h-40 w-40 text-brand-yellow" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="bg-brand-yellow text-brand-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                            Security Requirement
                        </div>
                        <h3 className="text-3xl font-black flex items-center gap-3">
                            Identity Verification Required
                        </h3>
                        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                            To ensure the safety of our physical assets and members, we require all paying members to be identity-verified.
                        </p>
                    </div>
                    <Button variant="outline" className="shrink-0 h-14 px-8 text-lg font-bold border-brand-yellow/20 hover:bg-brand-yellow hover:text-brand-dark rounded-2xl transition-all relative z-10" asChild>
                        <Link href="/dashboard/settings?tab=identity">Verify My Identity</Link>
                    </Button>
                </div>

                {/* Footer Note */}
                <div className="mt-20 text-center text-muted-foreground text-sm">
                    <p className="flex items-center justify-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Prishtina Hackerspace is a Non-Profit NGO based in Prishtina, Kosovo.
                    </p>
                </div>
            </div>
        </div>
    );
}

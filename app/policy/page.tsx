import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";

export default function PRHSPolicyPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Prishtina Hackerspace Policy</h1>
                <p className="text-muted-foreground">Community Guidelines & Code of Conduct</p>
            </div>
            <Separator />

            <div className="space-y-6 text-sm leading-relaxed">
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Our Mission</h2>
                    <p>
                        Prishtina Hackerspace is a community-driven space for makers, hackers, artists, and technologists to learn, collaborate, and create. We are committed to fostering an inclusive, safe, and productive environment for all members.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Core Principle: Be Excellent to Each Other</h2>
                    <p>
                        This is our golden rule. Treat everyone with respect, kindness, and empathy. We celebrate diversity and welcome people of all backgrounds, skill levels, and identities.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Code of Conduct</h2>
                    <p>All members must adhere to the following:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Respect:</strong> Be respectful in all interactions. Harassment, discrimination, or hate speech of any kind will not be tolerated.</li>
                        <li><strong>Collaboration:</strong> Share knowledge, help others, and work together. We are a community, not competitors.</li>
                        <li><strong>Safety:</strong> Follow all safety guidelines when using equipment. Report any unsafe conditions immediately.</li>
                        <li><strong>Consent:</strong> Always ask before touching someone else's project or belongings.</li>
                        <li><strong>Accountability:</strong> Take responsibility for your actions. If you make a mistake, own it and make it right.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Equipment Usage Rules</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Training Required:</strong> You must be trained before using certain equipment (3D printers, laser cutters, power tools, etc.).</li>
                        <li><strong>Clean Up:</strong> Leave the space cleaner than you found it. Clean up after yourself and put tools back where they belong.</li>
                        <li><strong>Reservations:</strong> Some equipment may require reservations. Check the schedule and respect others' time slots.</li>
                        <li><strong>Damage:</strong> If you break something, report it immediately. Accidents happen, but hiding them is not acceptable.</li>
                        <li><strong>Personal Projects:</strong> You may work on personal projects, but commercial use requires prior approval.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Membership Rules</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Active Membership:</strong> Pay your membership fees on time to maintain access.</li>
                        <li><strong>Guest Policy:</strong> Members may bring guests, but are responsible for their behavior.</li>
                        <li><strong>Access Hours:</strong> Respect the hackerspace's operating hours. 24/7 access may be granted to trusted members.</li>
                        <li><strong>Storage:</strong> Members may have limited storage space. Label your items and remove them when your membership ends.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Prohibited Activities</h2>
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                            <p className="font-semibold">The following activities are strictly prohibited:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Illegal activities of any kind.</li>
                                <li>Harassment, discrimination, or hate speech.</li>
                                <li>Vandalism or intentional damage to property.</li>
                                <li>Theft or unauthorized use of others' belongings.</li>
                                <li>Intoxication or substance abuse on the premises.</li>
                                <li>Sharing inappropriate, offensive, or harmful content (online or offline).</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Enforcement</h2>
                    <p>
                        Violations of this policy may result in:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Warning:</strong> First-time minor violations may result in a verbal or written warning.</li>
                        <li><strong>Suspension:</strong> Repeated or serious violations may result in temporary suspension of membership.</li>
                        <li><strong>Permanent Ban:</strong> Severe violations (illegal activity, harassment, violence) will result in immediate and permanent ban from the hackerspace and all FLOSSK events.</li>
                    </ul>
                    <p className="mt-2">
                        Decisions are made by the FLOSSK board and hackerspace coordinators. Appeals can be submitted to <a href="mailto:info@flossk.org" className="text-primary underline">info@flossk.org</a>.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Reporting Issues</h2>
                    <p>
                        If you witness or experience a violation of this policy, please report it immediately:
                    </p>
                    <ul className="list-none space-y-1 ml-4">
                        <li><strong>In-Person:</strong> Speak to a hackerspace coordinator or FLOSSK board member.</li>
                        <li><strong>Email:</strong> <a href="mailto:info@flossk.org" className="text-primary underline">info@flossk.org</a></li>
                        <li><strong>Anonymous:</strong> We will provide an anonymous reporting form soon.</li>
                    </ul>
                    <p className="mt-2">
                        All reports will be taken seriously and handled confidentially.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Acknowledgment</h2>
                    <p>
                        By becoming a member of Prishtina Hackerspace, you acknowledge that you have read, understood, and agree to abide by this policy. Let's build an amazing community together!
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Contact</h2>
                    <ul className="list-none space-y-1 ml-4">
                        <li><strong>Email:</strong> <a href="mailto:info@flossk.org" className="text-primary underline">info@flossk.org</a></li>
                        <li><strong>Organization:</strong> Free Libre Open Source Software Kosova (FLOSSK)</li>
                        <li><strong>Location:</strong> Prishtina, Kosovo</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

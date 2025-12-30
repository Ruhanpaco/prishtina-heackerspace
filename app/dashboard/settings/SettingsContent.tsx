"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession, getCsrfToken } from "next-auth/react";
import { useTheme } from "next-themes";
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe, FaInstagram, FaFacebook, FaLink, FaTrash } from "react-icons/fa";
import { Plus, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { IdentityVerification } from "@/components/dashboard/IdentityVerification";

import prohibitedConfig from "@/lib/prohibited-terms.json";

interface SocialLink {
    id: string;
    url: string;
    platform: string;
}

const getProhibitedData = () => {
    const config = prohibitedConfig as any;
    const categories = config.categories || {};
    const globalRules = config.global_blocking_rules || {};

    let keywords: string[] = [];

    Object.values(categories).forEach((cat: any) => {
        if (cat.blocked_keywords) keywords.push(...cat.blocked_keywords);
        if (cat.blocked_domains) keywords.push(...cat.blocked_domains);
        if (cat.blocked_url_patterns) keywords.push(...cat.blocked_url_patterns);
    });

    return {
        keywords: keywords.map(k => k.toLowerCase()),
        blockedTlds: (globalRules.block_suspicious_tlds || []).map((t: string) => t.toLowerCase())
    };
};

const { keywords: BLOCK_KEYWORDS, blockedTlds: BLOCK_TLDS } = getProhibitedData();

interface SettingsContentProps {
    defaultTab: string;
}

export function SettingsContent({ defaultTab }: SettingsContentProps) {
    const { toast } = useToast();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const user = session?.user;
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: "",
        username: "",
        bio: "",
        jobTitle: "",
        location: "",
        phoneNumber: "",
        email: "",
        emailVerified: null as string | null // date string or null
    });

    // Link State
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [linkError, setLinkError] = useState("");
    const [showPolicy, setShowPolicy] = useState(false);

    // Verification State
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");

    // Email Management State
    const [secondaryEmails, setSecondaryEmails] = useState<string[]>([]);
    const [newSecondaryEmail, setNewSecondaryEmail] = useState("");
    const [isAddingEmail, setIsAddingEmail] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [newPrimaryEmail, setNewPrimaryEmail] = useState("");
    const [changeEmailToken, setChangeEmailToken] = useState("");
    const [isVerifyingChange, setIsVerifyingChange] = useState(false);
    const [isIdentityEnabled, setIsIdentityEnabled] = useState(true);

    // Prevent hydration mismatch for theme
    useEffect(() => {
        setMounted(true);
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/v2/GET/config");
            const data = await res.json();
            setIsIdentityEnabled(data.identificationEnabled);
        } catch (error) {
            console.error("Failed to fetch config", error);
        }
    };

    // Fetch User Data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.id) return;
            try {
                const res = await fetch(`/api/v2/GET/users/${session.user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setProfile({
                            name: data.user.name || "",
                            username: data.user.username || "",
                            bio: data.user.bio || "",
                            jobTitle: data.user.title || "", // Map 'title' to 'jobTitle'
                            location: data.user.location || "",
                            phoneNumber: data.user.phoneNumber || "",
                            email: data.user.email || "",
                            emailVerified: data.user.emailVerified || null
                        });
                        if (data.user.links && Array.isArray(data.user.links)) {
                            setLinks(data.user.links);
                        }
                        if (data.user.secondaryEmails && Array.isArray(data.user.secondaryEmails)) {
                            setSecondaryEmails(data.user.secondaryEmails);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        };

        if (session?.user?.id) {
            fetchUserData();
        }
    }, [session]);

    const validateUrl = (url: string): { isValid: boolean; error?: string } => {
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return { isValid: false, error: "Only HTTP/HTTPS allowed" };
            }

            const lowerUrl = url.toLowerCase();
            const hostname = parsed.hostname.toLowerCase();

            // Check TLDs
            if (BLOCK_TLDS.some((tld: string) => hostname.endsWith(tld))) {
                return { isValid: false, error: "This domain extension is not allowed." };
            }

            // Check Keywords/Domains in full URL
            const foundTerm = BLOCK_KEYWORDS.find(term => lowerUrl.includes(term));
            if (foundTerm) {
                return { isValid: false, error: "This URL contains prohibited content." };
            }

            return { isValid: true };
        } catch (e) {
            return { isValid: false, error: "Invalid URL format" };
        }
    };

    const detectPlatform = (url: string) => {
        const lower = url.toLowerCase();
        if (lower.includes("github.com")) return "github";
        if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
        if (lower.includes("linkedin.com")) return "linkedin";
        if (lower.includes("instagram.com")) return "instagram";
        if (lower.includes("facebook.com")) return "facebook";
        return "website";
    };

    const handleAddLink = () => {
        setLinkError("");
        if (!newLinkUrl) return;

        const validation = validateUrl(newLinkUrl);
        if (!validation.isValid) {
            setLinkError(validation.error || "Invalid URL");
            return;
        }

        const platform = detectPlatform(newLinkUrl);
        const newLink: SocialLink = {
            id: crypto.randomUUID(),
            url: newLinkUrl,
            platform
        };

        setLinks([...links, newLink]);
        setNewLinkUrl("");
    };

    const handleRemoveLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id));
    };

    const handleSendVerification = async () => {
        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/POST/auth/send-verification', {
                method: 'POST',
                headers: { 'X-CSRF-Token': csrfToken || '' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast({
                title: "Email Sent",
                description: "Review your inbox for the verification code.",
            });
            setIsVerifying(true);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: error.message || "Failed to send verification email.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/POST/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ token: verificationCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast({
                title: "Success",
                description: "Your email has been verified.",
            });
            setIsVerifying(false);
            setProfile(prev => ({ ...prev, emailVerified: data.emailVerified })); // Assuming data.emailVerified is the date string
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Verification Failed",
                description: error.message || "Invalid code.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Email Management Handlers
    const handleAddSecondaryEmail = async () => {
        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/POST/auth/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ email: newSecondaryEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSecondaryEmails(data.secondaryEmails);
            setNewSecondaryEmail("");
            setIsAddingEmail(false);
            toast({ title: "Success", description: "Secondary email added." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSecondaryEmail = async (email: string) => {
        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/DELETE/auth/emails', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSecondaryEmails(data.secondaryEmails);
            toast({ title: "Success", description: "Secondary email removed." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitiateEmailChange = async () => {
        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/POST/auth/change-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ newEmail: newPrimaryEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIsChangingEmail(false);
            setIsVerifyingChange(true);
            toast({ title: "Check your new email", description: "We sent a verification code to your new address." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmailChange = async () => {
        setIsLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/POST/auth/verify-new-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ token: changeEmailToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Update local state
            setProfile(prev => ({ ...prev, email: data.email, emailVerified: new Date().toISOString() }));

            // If old email was added to secondary list, fetch update or push locally
            // Ideally re-fetch or optimistically update. Let's re-fetch briefly/lazily
            if (!secondaryEmails.includes(profile.email)) {
                setSecondaryEmails([...secondaryEmails, profile.email]);
            }

            setIsVerifyingChange(false);
            setChangeEmailToken("");
            setNewPrimaryEmail("");

            toast({ title: "Success", description: "Primary email updated successfully." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case "github": return <FaGithub className="h-4 w-4" />;
            case "twitter": return <FaTwitter className="h-4 w-4" />;
            case "linkedin": return <FaLinkedin className="h-4 w-4" />;
            case "instagram": return <FaInstagram className="h-4 w-4" />;
            case "facebook": return <FaFacebook className="h-4 w-4" />;
            default: return <FaLink className="h-4 w-4" />;
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setIsLoading(true);
        try {
            const payload = {
                ...profile,
                title: profile.jobTitle, // Map back to DB field 'title'
                links
            };

            const csrfToken = await getCsrfToken();
            const res = await fetch('/api/v2/PATCH/auth/profile', {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || ''
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update profile");
            }

            toast({
                title: "Settings saved",
                description: "Your profile has been updated successfully.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save settings.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = () => {
        toast({
            title: "Coming Soon",
            description: "Password change functionality is currently under development.",
        });
    };

    if (!mounted) return null;

    const showIdentityTab = isIdentityEnabled && (user as any)?.identificationStatus !== 'VERIFIED';

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <Separator />
            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    {showIdentityTab && <TabsTrigger value="identity">Identity</TabsTrigger>}
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your photo, personal details, and public links.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-x-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user?.image || ""} />
                                    <AvatarFallback className="text-xl">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" size="sm">Change Avatar</Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle">Job Title</Label>
                                    <Input
                                        id="jobTitle"
                                        value={profile.jobTitle}
                                        onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                                        placeholder="e.g. Software Engineer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={profile.location}
                                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                        placeholder="e.g. Prishtina, Kosovo"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us a little bit about yourself"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Brief description for your profile.
                                </p>
                            </div>

                            <Separator />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Links</CardTitle>
                            <CardDescription>
                                Manage your public profile links.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium">Public Links</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add links to your website, blog, or social media profiles.
                                    </p>
                                </div>

                                {/* Link List */}
                                <div className="space-y-2">
                                    {links.map((link) => (
                                        <div key={link.id} className="flex items-center gap-2 p-2 rounded-md border bg-muted/20 group">
                                            <div className="flex-shrink-0 text-muted-foreground">
                                                {getPlatformIcon(link.platform)}
                                            </div>
                                            <div className="flex-1 text-sm font-medium truncate">
                                                {link.url}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveLink(link.id)}
                                            >
                                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                    ))}
                                    {links.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">No links added yet.</p>
                                    )}
                                </div>

                                {/* Add Link Input */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="add-link">Add URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="add-link"
                                            placeholder="https://..."
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddLink();
                                                }
                                            }}
                                            className={cn(linkError && "border-destructive focus-visible:ring-destructive")}
                                        />
                                        <Button type="button" onClick={handleAddLink} variant="secondary">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                    {linkError && (
                                        <p className="text-sm text-destructive font-medium">{linkError}</p>
                                    )}
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        <button
                                            type="button"
                                            className="text-primary hover:underline font-medium flex items-center gap-1"
                                            onClick={() => setShowPolicy(!showPolicy)}
                                        >
                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                            Allowed Content Policy
                                        </button>
                                        {showPolicy && (
                                            <div className="mt-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                                <p className="font-semibold mb-1">Warning:</p>
                                                <p>
                                                    If we detect any inappropriate links, we will <strong>ban you from the platform</strong>,
                                                    and from <strong>Prishtina Hackerspace</strong> and its events.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* IDENTITY TAB */}
                {showIdentityTab && (
                    <TabsContent value="identity" className="space-y-4">
                        <IdentityVerification
                            status={(session?.user as any)?.identificationStatus || 'NONE'}
                            onSuccess={() => {
                                // Optionally trigger a session refresh or re-fetch
                                window.location.reload();
                            }}
                        />
                    </TabsContent>
                )}

                {/* ACCOUNT TAB (User Information) */}
                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>
                                Manage your sensitive account data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Email Section */}
                            <div className="space-y-4">
                                <Label>Email Address</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        value={profile.email}
                                        disabled
                                        className="max-w-md bg-muted"
                                    />
                                    {profile.emailVerified ? (
                                        <div className="flex items-center gap-2 text-green-600 font-medium px-3 py-2 bg-green-500/10 rounded-md border border-green-500/20">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {isVerifying ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="123456"
                                                        className="w-32"
                                                        value={verificationCode}
                                                        onChange={(e) => setVerificationCode(e.target.value)}
                                                    />
                                                    <Button size="sm" onClick={handleVerifyCode} disabled={isLoading}>
                                                        Submit
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setIsVerifying(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="secondary" size="sm" onClick={handleSendVerification} disabled={isLoading}>
                                                    Verify Email
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {!profile.emailVerified && !isVerifying && (
                                    <div className="flex items-center gap-2 p-3 text-sm text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded-md max-w-md">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>Your email is not verified. please verify to access all features.</span>
                                    </div>
                                )}
                            </div>

                            {/* Email Management UI */}
                            {/* Change Primary Email */}
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="text-sm font-medium">Change Email</h4>
                                {isVerifyingChange ? (
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Verification Code"
                                            value={changeEmailToken}
                                            onChange={(e) => setChangeEmailToken(e.target.value)}
                                            className="w-40"
                                        />
                                        <Button size="sm" onClick={handleVerifyEmailChange} disabled={isLoading}>Confirm Change</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsVerifyingChange(false)}>Cancel</Button>
                                    </div>
                                ) : isChangingEmail ? (
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            placeholder="New Email Address"
                                            value={newPrimaryEmail}
                                            onChange={(e) => setNewPrimaryEmail(e.target.value)}
                                            className="max-w-xs"
                                        />
                                        <Button size="sm" onClick={handleInitiateEmailChange} disabled={isLoading}>Send Code</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsChangingEmail(false)}>Cancel</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsChangingEmail(true)}>Change Primary Email</Button>
                                )}
                            </div>

                            {/* Secondary Emails */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-medium">Alternative Login Emails</h4>
                                        <p className="text-xs text-muted-foreground">You can use these emails to log in.</p>
                                    </div>
                                    {!isAddingEmail && <Button size="sm" variant="outline" onClick={() => setIsAddingEmail(true)}><Plus className="h-3 w-3 mr-1" /> Add Email</Button>}
                                </div>

                                {isAddingEmail && (
                                    <div className="flex gap-2 items-center mb-2">
                                        <Input
                                            placeholder="Enter secondary email"
                                            value={newSecondaryEmail}
                                            onChange={(e) => setNewSecondaryEmail(e.target.value)}
                                            className="max-w-xs"
                                        />
                                        <Button size="sm" onClick={handleAddSecondaryEmail} disabled={isLoading}>Add</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsAddingEmail(false)}>Cancel</Button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {secondaryEmails.map(email => (
                                        <div key={email} className="flex items-center justify-between p-2 rounded-md border bg-muted/40">
                                            <span className="text-sm">{email}</span>
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleRemoveSecondaryEmail(email)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {secondaryEmails.length === 0 && !isAddingEmail && (
                                        <p className="text-xs text-muted-foreground italic">No alternative emails added.</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Phone Section */}
                            <div className="space-y-4">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="max-w-md">
                                    <Input
                                        id="phone"
                                        value={profile.phoneNumber}
                                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                        placeholder="+383 4X XXX XXX"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePasswordChange}>Change Password</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Multi-Factor Authentication</CardTitle>
                            <CardDescription>
                                Secure your account with two-factor authentication.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>App Authenticator</Label>
                                    <p className="text-sm text-muted-foreground">Use an app like Google Authenticator or Authy.</p>
                                </div>
                                <Switch disabled />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>SMS Authentication</Label>
                                    <p className="text-sm text-muted-foreground">Receive a code via SMS to your phone.</p>
                                </div>
                                <Switch disabled />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Membership Status</CardTitle>
                            <CardDescription>View and manage your current subscription.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Status</p>
                                    <p className="text-sm text-muted-foreground">Active - Professional Tier</p>
                                </div>
                                <Badge variant="outline" className="bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 uppercase font-black text-[10px]">PRO</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Next Billing Date</p>
                                <p className="text-sm text-muted-foreground">January 15, 2024</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline">Manage Subscription</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* PREFERENCES TAB */}
                <TabsContent value="preferences" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interface Preferences</CardTitle>
                            <CardDescription>Customize your dashboard experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Appearance</Label>
                                    <p className="text-sm text-muted-foreground">Switch between light and dark modes.</p>
                                </div>
                                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                                    <Button
                                        variant={theme === "light" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTheme("light")}
                                    >
                                        Light
                                    </Button>
                                    <Button
                                        variant={theme === "dark" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTheme("dark")}
                                    >
                                        Dark
                                    </Button>
                                    <Button
                                        variant={theme === "system" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTheme("system")}
                                    >
                                        System
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive updates about space events and maintenance.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

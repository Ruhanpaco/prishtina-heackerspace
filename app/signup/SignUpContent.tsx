"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpContent() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/v2/POST/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    username,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            router.push("/?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:block relative h-full w-full bg-brand-dark">
                <Image
                    src="/assets/images/Instagram Photo 509396115.jpg"
                    alt="Prishtina Hackerspace Community"
                    fill
                    className="object-cover opacity-90"
                    priority
                    sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
                <div className="absolute bottom-12 left-12 p-6 text-white z-10">
                    <div className="mb-4">
                        <Image
                            src="/assets/images/logos/FLOSSK Hub Logo.png"
                            alt="FLOSSK Logo"
                            width={80}
                            height={80}
                            className="drop-shadow-lg brightness-110"
                        />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 leading-none">Join the<br />Community</h2>
                    <p className="text-brand-yellow font-bold tracking-[0.2em] text-sm uppercase mt-4 border-l-2 border-brand-yellow pl-3">
                        Start Building Today
                    </p>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex items-center justify-center h-full w-full p-8 overflow-y-auto">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your details below to join the hub
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                                        {error}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        type="text"
                                        autoCapitalize="words"
                                        autoComplete="name"
                                        autoCorrect="off"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="johndoe"
                                        type="text"
                                        autoCapitalize="none"
                                        autoComplete="username"
                                        autoCorrect="off"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button className="w-full bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-bold" type="submit" disabled={isLoading}>
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full bg-background hover:bg-muted" disabled={isLoading}>
                                <FaGithub className="mr-2 h-4 w-4" />
                                Github
                            </Button>
                            <Button variant="outline" className="w-full bg-background hover:bg-muted" disabled={isLoading}>
                                <FaGoogle className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </div>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>

                    <div className="pt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/" className="font-bold text-foreground hover:text-brand-yellow transition-colors underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

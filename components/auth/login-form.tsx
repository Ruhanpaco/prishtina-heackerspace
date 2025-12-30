"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate } from "@/app/actions/auth-actions";

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

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
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 leading-none">Prishtina<br />Hackerspace</h2>
                    <p className="text-brand-yellow font-bold tracking-[0.2em] text-sm uppercase mt-4 border-l-2 border-brand-yellow pl-3">
                        Community Portal Access
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center h-full w-full p-8">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {isRegistered && (
                            <div className="bg-green-500/15 border border-green-500/20 text-green-600 text-sm p-3 rounded-md text-center">
                                Account created! Please sign in.
                            </div>
                        )}
                        <form action={formAction}>
                            <div className="grid gap-4">
                                {errorMessage && (
                                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                        {errorMessage}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-xs font-medium text-muted-foreground hover:text-brand-yellow transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button className="w-full bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-bold" type="submit" disabled={isPending}>
                                    {isPending ? "Signing in..." : "Sign In w/ Email"}
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
                            <Button variant="outline" className="w-full bg-background hover:bg-muted">
                                <FaGithub className="mr-2 h-4 w-4" />
                                Github
                            </Button>
                            <Button variant="outline" className="w-full bg-background hover:bg-muted">
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
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-bold text-foreground hover:text-brand-yellow transition-colors underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
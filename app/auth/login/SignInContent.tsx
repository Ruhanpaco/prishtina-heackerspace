"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { FaEnvelope, FaLock, FaGithub, FaGoogle, FaArrowRight } from "react-icons/fa";
import { authenticate } from "@/app/actions/auth-actions";

export function SignInContent() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 font-sans selection:bg-brand-yellow/30 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/images/background/image.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-[#1D1D1B]/80 backdrop-blur-[2px]" />
            </div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-[480px] group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-yellow/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative flex flex-col items-center bg-[#1D1D1B] border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl overflow-hidden">

                    {/* Top Logo Section */}
                    <div className="mb-10 transform hover:scale-105 transition-transform duration-500">
                        <Image
                            src="/assets/images/logos/FLOSSK Hub Logo.png"
                            alt="FLOSSK Logo"
                            width={100}
                            height={100}
                            className="drop-shadow-2xl brightness-110"
                            priority
                        />
                    </div>

                    {/* Header */}
                    <div className="w-full text-center mb-10">
                        <h1 className="text-3xl font-black text-brand-light uppercase tracking-tighter mb-2">
                            Sign In
                        </h1>
                        <p className="text-gray-400 text-sm font-medium tracking-wide">
                            FLOSSK CRM • PRISHTINA HACKERSPACE
                        </p>
                    </div>

                    {/* Form */}
                    <form className="w-full space-y-6" action={formAction}>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[3px]">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-yellow transition-colors">
                                    <FaEnvelope size={14} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    className="block w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-1 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 focus:outline-none transition-all placeholder:text-gray-600 text-brand-light text-sm"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-[10px] text-brand-yellow/60 hover:text-brand-yellow transition-colors font-black uppercase tracking-wider">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-yellow transition-colors">
                                    <FaLock size={14} />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    className="block w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-1 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 focus:outline-none transition-all placeholder:text-gray-600 text-brand-light text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="text-red-500 text-xs font-bold text-center uppercase tracking-wide bg-red-500/10 p-2 rounded">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-3 py-4.5 px-6 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark font-black rounded-2xl shadow-xl shadow-brand-yellow/5 transform transition-all active:scale-[0.98] group uppercase tracking-[4px] text-[11px] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Authenticating...' : 'Enter Hub'}
                            {!isPending && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Social Links */}
                    <div className="w-full mt-10">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="w-full border-t border-white/5"></div>
                            <span className="absolute bg-[#1D1D1B] px-4 text-[9px] uppercase font-black tracking-[4px] text-gray-600">
                                Connection
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-all group">
                                <FaGithub className="text-gray-500 group-hover:text-brand-light transition-colors" size={16} />
                                <span className="text-[9px] font-black tracking-widest uppercase text-gray-500 group-hover:text-brand-light">GitHub</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-all group">
                                <FaGoogle className="text-gray-500 group-hover:text-brand-light transition-colors" size={14} />
                                <span className="text-[9px] font-black tracking-widest uppercase text-gray-500 group-hover:text-brand-light">Google</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer link */}
                    <p className="mt-10 text-center text-gray-600 text-[9px] font-bold tracking-[2px] uppercase">
                        No access?{' '}
                        <a href="#" className="font-black text-brand-yellow hover:text-brand-yellow/80 transition-colors">
                            Apply Here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

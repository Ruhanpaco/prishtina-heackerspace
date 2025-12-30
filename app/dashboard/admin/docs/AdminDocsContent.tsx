"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Code, Lock, Terminal, Shield, Zap, ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    description: string;
    auth: 'public' | 'authenticated' | 'service-to-service' | 'admin-only';
    permission?: string;
    requestBody?: string;
    responses: { code: number; description: string; }[];
    details?: string;
    howToCall?: string;
}

const GUIDES = {
    "Executive Summary": {
        title: "Platform Infrastructure Specification",
        description: "This document serves as the formal technical reference for the Prishtina Hackerspace (PRHS) Digital Ecosystem. It defines the communication protocols, security constraints, and data orchestration strategies that power our member services, physical access control, and security intelligence.",
        sections: [
            {
                title: "Purpose & Scope",
                content: "The specifications outlined herein are designed to ensure seamless integration between the platform's core services and external hardware (RFID terminals), while maintaining a 'Security-First' posture. This is the authoritative source for internal engineering and authorized third-party integrations."
            },
            {
                title: "Internal Compliance",
                content: "All interactions with the PRHS API are subject to real-time forensic auditing. Developers must adhere to the Principle of Least Privilege (PoLP) and ensure all requests originate from authorized, TLS-secured nodes."
            }
        ]
    },
    "Architectural Overview": {
        title: "Technical Architecture",
        description: "A high-level view of the PRHS stack, designed for high throughput and cryptographic integrity.",
        sections: [
            {
                title: "Core Stack",
                content: "• Framework: Next.js 15 (App Router)\n• Persistence: MongoDB with Mongoose ODM\n• Identity: NextAuth with custom JWT orchestration\n• Infrastructure: Edge-optimized serverless functions"
            },
            {
                title: "The RFID Link-Layer",
                content: "Hardened communication between physical ESP32 terminals and the cloud. Uses signed terminal tokens issued via periodic cryptographic handshakes."
            }
        ]
    },
    "Security Posture": {
        title: "Cryptographic Protocols",
        description: "Detailed breakdown of the platform's defense-in-depth security model.",
        sections: [
            {
                title: "Quad-Layer Encryption",
                content: "Every identity document is processed through four independent cryptographic layers:\n1. Layer 1 (System): Global infrastructure key.\n2. Layer 2 (User): Per-user derived secret.\n3. Layer 3 (Pepper): Application-level high-entropy pepper.\n4. Layer 4 (Envelope): AES-256-GCM integrity envelope."
            },
            {
                title: "Heuristic Threat Detection",
                content: "Real-time analysis of audit logs using the 'Security Engine'. Detects brute-force, credential stuffing, and anomalous movement patterns within milliseconds of occurrence."
            }
        ]
    },
    "Hardware Integration": {
        title: "Hardware Integration Suite",
        description: "Blueprints for connecting physical access control hardware to the PRHS Digital Protocol.",
        sections: [
            {
                title: "The Signed Handshake",
                content: "To prevent UID spoofing, the API does not accept raw RFID UIDs. Terminals must sign a JWT containing the UID using a hardware-stored `TERMINAL_SECRET` (HMAC-SHA256). \n\nPayload structure: \n```json\n{\n  \"uid\": \"A1B2C3D4\",\n  \"iat\": 1700000000\n}\n```"
            },
            {
                title: "ESP32 / Arduino (C++)",
                content: "Use the `HTTPClient` and `ArduinoJson` libraries. For JWT signing, the `arduino-crypto` library is recommended to generate the HMAC-SHA256 signature locally on the chip before transmission."
            },
            {
                title: "Raspberry Pi (Python)",
                content: "Integration via the `pyjwt` and `requests` libraries. This is the preferred method for terminals requiring localized offline logging or complex peripherals (e.g., thermal cameras).\n\n```python\nimport jwt\ntoken = jwt.encode({'uid': uid}, secret, algorithm='HS256')\nrequests.post(url, json={'uid': uid, 'token': token})\n```"
            },
            {
                title: "Legacy & Office Systems",
                content: "Existing office systems using Wiegand protocols can be retrofitted using a Wiegand-to-Ethernet bridge. A middleware service (Node.js/Python) sits between the bridge and the PRHS API to perform the required signing and orchestration."
            }
        ]
    }
};

const ENDPOINTS: Record<string, Endpoint[]> = {
    "Auth & Identity": [
        {
            method: 'POST',
            path: '/api/v2/POST/auth/signup',
            description: 'Registers a new member profile and initializes their security vault.',
            auth: 'public',
            requestBody: '{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "password": "securepassword123"\n}',
            responses: [
                { code: 201, description: 'Success: User created, salts generated, pepper applied.' },
                { code: 409, description: 'Conflict: Email already exists in indexed space.' }
            ],
            details: "When this is called, the system generates unique salts for the user, hashes the password using high-cost rounds, and initiates the identity metadata record in MongoDB. A welcome email is queued via the SMTP handler.",
            howToCall: "const csrfToken = await getCsrfToken();\nfetch('/api/v2/POST/auth/signup', {\n  method: 'POST',\n  headers: { 'X-CSRF-Token': csrfToken },\n  body: JSON.stringify(data)\n});"
        },
        {
            method: 'GET',
            path: '/api/v2/GET/users/me',
            description: 'Returns the current session user data and their permission set.',
            auth: 'authenticated',
            responses: [
                { code: 200, description: 'Success: Returns sanitized user object.' },
                { code: 401, description: 'Error: Session cookie expired or token malformed.' }
            ],
            details: "The system identifies the user from the JWT/Cookie, verifies their membership status, and returns a profile object excluding sensitive fields like password hashes or MFA secrets.",
            howToCall: "fetch('/api/v2/GET/users/me', {\n  headers: { 'Authorization': 'Bearer ' + token }\n});"
        }
    ],
    "Space Presence (RFID)": [
        {
            method: 'POST',
            path: '/api/v2/POST/space/checkin',
            description: 'RFID Terminal check-in/out toggle with cryptographic signature check.',
            auth: 'service-to-service',
            permission: 'Terminal Signed Link',
            requestBody: '{\n  "uid": "AB12CD34",\n  "token": "JWT_SIGNED_BY_TERMINAL"\n}',
            responses: [
                { code: 200, description: 'Success: Presence status toggled in User model.' },
                { code: 403, description: 'Error: Terminal token signature mismatch.' }
            ],
            details: "The engine validates the terminal token signature. If valid, it looks up the user by RFID UID, toggles their `isPresent` field, and creates a presence audit log entry.",
            howToCall: "curl -X POST /api/v2/POST/space/checkin -d '{\"uid\": \"...\"}'"
        }
    ],
    "Identity & Security": [
        {
            method: 'POST',
            path: '/api/v2/POST/auth/identity/upload',
            description: 'Archival of identity documents with Quad-Layer Encryption.',
            auth: 'authenticated',
            requestBody: '{\n  "type": "ID_CARD",\n  "files": { "front": "base64", "back": "base64" }\n}',
            responses: [
                { code: 200, description: 'Success: Document encrypted and saved to Vault.' }
            ],
            details: "The images are combined with the user key, system key, and pepper. The resulting blob is stored in the Identity Vault, and the user's status is set to PENDING verification.",
            howToCall: "const csrfToken = await getCsrfToken();\nfetch('/api/v2/POST/auth/identity/upload', {\n  method: 'POST',\n  headers: { 'X-CSRF-Token': csrfToken },\n  body: JSON.stringify({ type, files })\n});"
        }
    ],
    "Security Intelligence": [
        {
            method: 'GET',
            path: '/api/v2/GET/admin/logs/analytics',
            description: 'High-level threat analytics and behavioral patterns.',
            auth: 'admin-only',
            permission: 'audit:log:read',
            responses: [
                { code: 200, description: 'Success: Returns heatmap and brute-force data.' }
            ],
            details: "Aggregates the last 24h of audit logs, identifying IP hotspots with high failure rates and detecting brute-force patterns across the platform.",
            howToCall: "fetch('/api/v2/GET/admin/logs/analytics')"
        }
    ]
};

export function AdminDocsContent() {
    const [activeSection, setActiveSection] = useState("Executive Summary");
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const isGuide = Object.keys(GUIDES).includes(activeSection);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen bg-accent/5">
            <div className="flex items-center justify-between border-b pb-6 border-white/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Terminal className="h-8 w-8 text-brand-yellow" />
                        Digital Infrastructure Specification
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm max-w-2xl font-mono uppercase tracking-widest text-[10px]">
                        PRHS Security-First Protocol v2.0.0 // Internal Engineering Reference
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Documentation Sidebar */}
                <div className="md:col-span-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-4 mb-3">Foundational Guides</p>
                    {Object.keys(GUIDES).map((guide) => (
                        <button
                            key={guide}
                            onClick={() => setActiveSection(guide)}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2",
                                activeSection === guide
                                    ? "bg-brand-yellow text-brand-dark font-bold shadow-lg shadow-brand-yellow/10"
                                    : "text-muted-foreground hover:bg-white/5 hover:translate-x-1"
                            )}
                        >
                            <Shield className="h-3.5 w-3.5 shrink-0" />
                            {guide}
                        </button>
                    ))}

                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-4 mt-8 mb-3">Endpoint References</p>
                    {Object.keys(ENDPOINTS).map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2",
                                activeSection === section
                                    ? "bg-brand-yellow text-brand-dark font-bold shadow-lg shadow-brand-yellow/10"
                                    : "text-muted-foreground hover:bg-white/5 hover:translate-x-1"
                            )}
                        >
                            <Terminal className="h-3.5 w-3.5 shrink-0" />
                            {section}
                        </button>
                    ))}

                    <div className="mt-12 p-4 bg-muted/20 border border-white/5 rounded-xl">
                        <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mb-2">
                            <Lock className="h-3 w-3" /> Integrity Check
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            System heartbeat 99.98%. Forensic logs active for all document access.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9">
                    {isGuide ? (
                        <div className="space-y-10 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">{(GUIDES as any)[activeSection].title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{(GUIDES as any)[activeSection].description}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {(GUIDES as any)[activeSection].sections.map((s: any, i: number) => (
                                    <div key={i} className="group transition-all">
                                        <h4 className="text-sm font-bold border-l-2 border-brand-yellow pl-4 mb-3 uppercase tracking-wider text-brand-yellow/90">
                                            {s.title}
                                        </h4>
                                        <div className="p-6 bg-black/40 rounded-xl border border-white/5 group-hover:border-brand-yellow/20 transition-colors shadow-sm">
                                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                                                {s.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-2xl font-bold tracking-tight">{activeSection}</h3>
                            {ENDPOINTS[activeSection].map((endpoint, i) => (
                                <Card key={i} className="bg-black/40 border-white/10 shadow-xl overflow-hidden group">
                                    <div className="flex items-center gap-4 p-4 bg-muted/20 border-b border-white/5">
                                        <Badge className={cn(
                                            "font-mono text-[10px] px-2",
                                            endpoint.method === 'GET' ? 'bg-blue-600' :
                                                endpoint.method === 'POST' ? 'bg-green-600' :
                                                    endpoint.method === 'DELETE' ? 'bg-red-600' : 'bg-yellow-600'
                                        )}>
                                            {endpoint.method}
                                        </Badge>
                                        <span className="text-sm font-mono font-bold tracking-tight text-brand-yellow/90">
                                            {endpoint.path}
                                        </span>
                                        <div className="ml-auto flex items-center gap-2">
                                            {endpoint.auth === 'admin-only' && <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-500 gap-1"><Shield className="h-2 w-2" /> Admin</Badge>}
                                            {endpoint.auth === 'service-to-service' && <Badge variant="outline" className="text-[9px] border-yellow-500/30 text-yellow-500 gap-1"><Zap className="h-2 w-2" /> System</Badge>}
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* Info Column */}
                                            <div className="lg:col-span-12 space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow mb-2">Orchestration & Lifecycle</h4>
                                                    <p className="text-xs text-foreground/90 leading-relaxed italic border-l-2 border-brand-yellow/20 pl-4 py-2 bg-brand-yellow/5 rounded-r-lg">
                                                        {endpoint.details}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Digital Payload Example</h4>
                                                        <div className="relative group/code">
                                                            <pre className="p-4 bg-black rounded-lg border border-white/5 font-mono text-[11px] overflow-x-auto text-green-400">
                                                                {endpoint.requestBody || '// No payload required'}
                                                            </pre>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="absolute top-2 right-2 h-7 px-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                                                onClick={() => copyToClipboard(endpoint.requestBody || "")}
                                                            >
                                                                {copied === endpoint.requestBody ? <ClipboardCheck className="h-3 w-3 text-green-500" /> : <Code className="h-3 w-3 text-muted-foreground" />}
                                                            </Button>
                                                        </div>

                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mt-4">Implementation Sample (Node.js)</h4>
                                                        <div className="relative group/call">
                                                            <pre className="p-4 bg-accent/5 rounded-lg border border-white/5 font-mono text-[10px] overflow-x-auto text-blue-300">
                                                                {endpoint.howToCall || `fetch('${endpoint.path}')`}
                                                            </pre>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="space-y-3">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Cryptographic Responses</h4>
                                                            <div className="space-y-2">
                                                                {endpoint.responses.map((res, j) => (
                                                                    <div key={j} className="flex flex-col p-3 bg-accent/5 rounded-xl border border-white/5 group/res hover:bg-white/5 transition-colors">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <div className={cn("w-1 h-3 rounded-full", res.code < 300 ? 'bg-green-500' : 'bg-red-500')} />
                                                                            <span className="text-xs font-bold font-mono">{res.code}</span>
                                                                        </div>
                                                                        <span className="text-[11px] text-muted-foreground leading-relaxed">
                                                                            {res.description}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

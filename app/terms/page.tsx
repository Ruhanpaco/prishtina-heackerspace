import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: December 26, 2025</p>
            </div>
            <Separator />

            <div className="space-y-6 text-sm leading-relaxed">
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using the Prishtina Hackerspace CRM ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">2. Description of Service</h2>
                    <p>
                        The Service is a member management platform for Prishtina Hackerspace, operated by Free Libre Open Source Software Kosova (FLOSSK). It provides tools for membership registration, billing, profile management, and community engagement.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">3. User Accounts</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>You must provide accurate and complete information when creating an account.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You are responsible for all activities that occur under your account.</li>
                        <li>You must notify us immediately of any unauthorized use of your account.</li>
                        <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">4. Acceptable Use Policy</h2>
                    <p>You agree NOT to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Use the Service for any illegal or unauthorized purpose.</li>
                        <li>Violate any laws in your jurisdiction (including but not limited to copyright laws).</li>
                        <li>Post or share content that is offensive, discriminatory, harassing, or harmful.</li>
                        <li>Attempt to gain unauthorized access to the Service or other users' accounts.</li>
                        <li>Interfere with or disrupt the Service or servers.</li>
                        <li>Use automated systems (bots, scrapers) without permission.</li>
                        <li>Share inappropriate links or content in your profile (see our <a href="/policy" className="text-primary underline">PRHS Policy</a>).</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">5. Membership and Payments</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Membership fees are processed securely via Stripe.</li>
                        <li>Fees are non-refundable unless otherwise stated.</li>
                        <li>We reserve the right to change membership fees with 30 days' notice.</li>
                        <li>Failure to pay membership fees may result in account suspension.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">6. Content and Intellectual Property</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>You retain ownership of content you post (profile information, bio, links).</li>
                        <li>By posting content, you grant us a license to display and use it within the Service.</li>
                        <li>The Service itself, including its design, code, and branding, is owned by FLOSSK and protected by intellectual property laws.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">7. Privacy</h2>
                    <p>
                        Your use of the Service is also governed by our <a href="/privacy" className="text-primary underline">Privacy Policy</a>. Please review it to understand how we collect, use, and protect your data.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">8. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your account at any time for violations of these Terms, illegal activity, or behavior that harms the community. You may also delete your account at any time via your account settings.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">9. Disclaimers</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>The Service is provided "as is" without warranties of any kind.</li>
                        <li>We do not guarantee uninterrupted or error-free operation.</li>
                        <li>We are not responsible for content posted by users.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">10. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, FLOSSK and Prishtina Hackerspace shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">11. Changes to Terms</h2>
                    <p>
                        We may update these Terms from time to time. We will notify you of significant changes via email or a prominent notice on the platform. Continued use of the Service after changes constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">12. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of Kosovo. Any disputes shall be resolved in the courts of Prishtina, Kosovo.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">13. Contact Us</h2>
                    <p>
                        If you have questions about these Terms, please contact us:
                    </p>
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

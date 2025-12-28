import { Separator } from "@/components/ui/separator"; // Force Node.js runtime for this page

export default function PrivacyPolicyPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: December 26, 2025</p>
            </div>
            <Separator />

            <div className="space-y-6 text-sm leading-relaxed">
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">1. Introduction</h2>
                    <p>
                        Welcome to Prishtina Hackerspace CRM ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our member management system.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                    <p>We collect the following types of information:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Account Information:</strong> Name, username, email address(es), phone number, and password (encrypted).</li>
                        <li><strong>Profile Information:</strong> Bio, job title, location, profile picture, and social media links.</li>
                        <li><strong>Membership Data:</strong> Membership status, billing history, and payment information (processed securely via Stripe).</li>
                        <li><strong>Usage Data:</strong> Log data, IP addresses, browser type, and activity within the platform for security and analytics purposes.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Provide and maintain our services.</li>
                        <li>Process membership registrations and payments.</li>
                        <li>Send important notifications (e.g., account updates, payment confirmations).</li>
                        <li>Improve our platform and user experience.</li>
                        <li>Ensure security and prevent fraud.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">4. Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal information. We may share your data with:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Service Providers:</strong> Third-party services like Stripe (payment processing) and email providers (transactional emails).</li>
                        <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
                        <li><strong>Community Members:</strong> Your public profile information (name, bio, social links) may be visible to other members.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your data, including encryption (HTTPS/TLS), secure password hashing (bcrypt), and access controls. However, no method of transmission over the internet is 100% secure.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Access and update your personal information via your account settings.</li>
                        <li>Request deletion of your account and associated data.</li>
                        <li>Opt-out of non-essential communications.</li>
                        <li>Request a copy of your data.</li>
                    </ul>
                    <p className="mt-2">
                        To exercise these rights, please contact us at <a href="mailto:info@flossk.org" className="text-primary underline">info@flossk.org</a>.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">7. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal, tax, or audit purposes.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">8. Cookies and Tracking</h2>
                    <p>
                        We use essential cookies for authentication and session management. We do not use third-party tracking or advertising cookies.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">9. Children's Privacy</h2>
                    <p>
                        Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">11. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us:
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

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
                    <p>
                        You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">4. Acceptable Use Policy</h2>
                    <p>You agree NOT to use the Service for any illegal or unauthorized purpose, violate any laws in your jurisdiction (including but not limited to copyright laws), post or share content that is offensive, discriminatory, harassing, or harmful, attempt to gain unauthorized access to the Service or other users' accounts, interfere with or disrupt the Service or servers, use automated systems (bots, scrapers) without permission, or share inappropriate links or content in your profile (see our <a href="/policy" className="text-primary underline">PRHS Policy</a>).</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">5. Membership and Physical Access to Prishtina Hackerspace</h2>

                    <p>
                        Active membership in the Prishtina Hackerspace CRM grants you physical access to the Prishtina Hackerspace facility located in Prishtina, Kosovo. This membership provides you with the right to use the space, equipment, and resources available at the hackerspace during your active membership period. The hackerspace is a collaborative workspace equipped with various tools, technologies, and equipment designed to support innovation, learning, and creation.
                    </p>

                    <p>
                        The physical space includes, but is not limited to, a fully equipped electronics laboratory with soldering stations and testing equipment, multiple 3D printers for rapid prototyping, laser cutting machines for precision work, a comprehensive collection of power tools and hand tools, dedicated workbenches and project areas, storage lockers for member projects, and collaborative spaces for team work and community events. Members have access to a wide range of microcontrollers and development boards including Arduino (various models including Uno, Mega, and Nano), Raspberry Pi (models 3, 4, and Zero), ESP32 and ESP8266 WiFi-enabled microcontrollers, and various sensors, motors, and electronic components available for use in projects.
                    </p>

                    <h3 className="text-lg font-semibold mt-4">RFID Access Card System - "Keys to the House"</h3>

                    <p>
                        Upon successful payment of your first monthly membership fee and completion of identity verification (as detailed in Section 6), you will be issued a Radio-Frequency Identification (RFID) access card. This card serves as your physical key to the Prishtina Hackerspace and is electronically linked to your CRM account. The RFID system is integrated with our membership management platform, ensuring that access privileges are automatically synchronized with your account status and payment history.
                    </p>

                    <p>
                        Your RFID card grants you entry to the hackerspace facility during designated access hours. Standard members have access during regular operating hours, typically from 9:00 AM to 10:00 PM on weekdays and 10:00 AM to 8:00 PM on weekends, subject to change based on community needs and facility management decisions. Trusted members who have demonstrated responsible use of the space and equipment for a minimum of three consecutive months may be granted 24/7 access privileges at the discretion of the FLOSSK board and hackerspace coordinators.
                    </p>

                    <p>
                        You are solely responsible for the security and proper use of your RFID access card. The card must not be shared, lent, or transferred to any other person under any circumstances. If your RFID card is lost, stolen, or compromised, you must immediately report this to a FLOSSK coordinator or via email to info@flossk.org. Upon report of a lost or stolen card, the card will be immediately deactivated in our system to prevent unauthorized access. A replacement RFID card will be issued for a fee of ten euros (€10) to cover the cost of the card and administrative processing. The replacement process typically takes 2-3 business days.
                    </p>

                    <h3 className="text-lg font-semibold mt-4">Monthly Membership Fees and Payment Requirements</h3>

                    <p>
                        Membership fees are charged on a monthly basis and must be paid in advance to maintain active status. All payments are processed securely through Stripe, our third-party payment processor, which complies with international payment security standards including PCI DSS (Payment Card Industry Data Security Standard). Your payment information is encrypted and securely stored by Stripe; we do not store complete credit card information on our servers.
                    </p>

                    <p>
                        Payment is due on the same day each month as your initial membership registration date. For example, if you registered on the 15th of the month, your payment will be due on the 15th of each subsequent month. We provide a three-day grace period from your payment due date. If payment is not received within seven days of the due date, your RFID access card will be automatically suspended by our system. You will receive email notifications at three days before due date, on the due date, and three days after the due date to remind you of pending or overdue payments.
                    </p>

                    <p>
                        Once payment is successfully processed, your RFID access will be automatically restored within 24 hours. If your account remains unpaid for sixty (60) consecutive days, your membership will be terminated, your RFID card will be permanently deactivated, and your account will be closed. Any stored projects or materials must be removed from the hackerspace within this period, or they will be considered abandoned property and may be disposed of or donated to the community.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">6. Identity Verification and Personal Data Requirements</h2>

                    <p>
                        In accordance with Kosovo law, specifically the Law on Personal Data Protection (Law No. 06/L-082), and to ensure the security and accountability of all members using the physical hackerspace facility, all members must complete a mandatory identity verification process before receiving RFID access privileges. This requirement is essential for maintaining a safe and secure environment for all community members and for compliance with legal obligations regarding facility access and liability.
                    </p>

                    <p>
                        You must provide a valid government-issued identification document for verification. Acceptable forms of identification include a Kosovo national identity card (Letërnjoftim/Lična karta), a valid passport issued by the Republic of Kosovo or any other recognized country, or a Kosovo driver's license. The identification document must be current and not expired. Your personal identification number (Numri Personal/Lični broj) from your Kosovo ID card will be securely recorded and linked to your CRM account as required by Kosovo regulations for facility access management.
                    </p>

                    <p>
                        The identity verification process can be completed in one of two ways. You may present your identification document in person to a FLOSSK coordinator at the hackerspace during regular operating hours, where it will be verified and a copy will be securely stored in our encrypted database. Alternatively, you may upload a clear, legible photograph or scan of your identification document through the secure verification portal in your CRM account settings, which will be reviewed and verified by authorized FLOSSK staff within 2-3 business days.
                    </p>

                    <p>
                        All personal identification data collected during this process is encrypted using industry-standard AES-256 encryption and stored in compliance with the Kosovo Law on Personal Data Protection. This information is used solely for the purposes of identity verification, security management, legal compliance, and emergency contact in case of incidents at the facility. Your personal data will never be sold, shared with third parties for marketing purposes, or used for any purpose other than those explicitly stated in our Privacy Policy. You have the right to request access to your stored identification data, request corrections to inaccurate information, or request deletion of your data upon termination of your membership, subject to legal retention requirements.
                    </p>

                    <p>
                        For members under the age of eighteen (18), additional requirements apply in accordance with Kosovo law regarding minors. Minors must provide written parental or legal guardian consent to participate in hackerspace activities. The parent or legal guardian must also provide their own government-issued identification for verification and must sign a liability waiver acknowledging the potential risks associated with equipment use. Minors under the age of sixteen (16) must be accompanied by a parent or legal guardian during their first three visits to the hackerspace and must complete mandatory safety training before being granted independent access to equipment.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">7. Enforcement, Account Suspension, and Legal Consequences</h2>

                    <p>
                        Prishtina Hackerspace and FLOSSK are committed to maintaining a safe, respectful, and law-abiding community. We take all violations of these Terms of Service and our PRHS Policy extremely seriously. Any behavior that violates Kosovo law, endangers other members, damages property, or disrupts the community will result in immediate and severe consequences as outlined in this section.
                    </p>

                    <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-destructive">Immediate Suspension and Enforcement Actions</h3>

                        <div className="space-y-3">
                            <p className="text-sm">
                                <strong>Theft of Equipment or Property:</strong> Any act of theft, including but not limited to stealing hackerspace equipment, tools, components, materials, or personal belongings of other members, constitutes a criminal offense under Article 323 of the Criminal Code of Kosovo (Law No. 06/L-074). Upon discovery or credible report of theft, your RFID access will be immediately deactivated, your CRM account will be suspended, and the incident will be reported to the Kosovo Police. You will be held financially liable for the full replacement value of stolen items plus administrative costs. This violation results in permanent ban from all FLOSSK facilities and events.
                            </p>

                            <p className="text-sm">
                                <strong>Vandalism and Property Damage:</strong> Intentional damage, destruction, or defacement of hackerspace equipment, infrastructure, or property is a criminal offense under Article 390 of the Criminal Code of Kosovo. This includes, but is not limited to, deliberately breaking equipment, damaging walls or furniture, destroying other members&apos; projects, or any other act of willful destruction. Immediate consequences include RFID deactivation, account suspension, police report, financial liability for repair or replacement costs (which may exceed €1,000 for specialized equipment), and permanent ban. Accidental damage must be reported immediately; concealing accidental damage will be treated as intentional vandalism.
                            </p>

                            <p className="text-sm">
                                <strong>Safety Violations and Reckless Behavior:</strong> Behavior that endangers yourself or others, including operating equipment without proper training, ignoring safety protocols, working under the influence of alcohol or drugs, or creating hazardous conditions, will result in immediate access suspension. Serious safety violations may result in permanent ban. Kosovo workplace safety regulations (Law No. 05/L-021 on Safety and Health at Work) apply to hackerspace activities.
                            </p>

                            <p className="text-sm">
                                <strong>Illegal Activities:</strong> Any criminal activity conducted on hackerspace premises, including but not limited to drug use or distribution, assault, fraud, cybercrime, or any violation of Kosovo criminal law, will result in immediate RFID deactivation, account termination, police notification, and permanent ban. We cooperate fully with law enforcement investigations.
                            </p>

                            <p className="text-sm">
                                <strong>Harassment and Discrimination:</strong> Harassment, discrimination, hate speech, or threatening behavior based on race, ethnicity, religion, gender, sexual orientation, disability, or any other protected characteristic is strictly prohibited under Kosovo law (Law No. 05/L-021 on Protection from Discrimination). Such behavior results in immediate suspension and potential permanent ban. Severe cases will be reported to appropriate authorities.
                            </p>

                            <p className="text-sm">
                                <strong>Unauthorized Access and Security Breaches:</strong> Using another person's RFID card, sharing your card with others, attempting to bypass security systems, or gaining unauthorized access to restricted areas constitutes a serious security violation. This may be prosecuted under Article 396 of the Criminal Code of Kosovo (Unauthorized Access to Computer Systems). Consequences include immediate permanent ban and potential legal action.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-4">Enforcement Process and Procedures</h3>

                    <p>
                        When a violation is reported or discovered, the following enforcement process will be initiated. First, your RFID access card will be immediately deactivated to prevent further access to the facility. This action is automatic and takes effect within minutes of the violation being reported to ensure facility security. Second, your CRM account and all associated services will be suspended pending investigation. You will receive an email notification of the suspension and the reason for the action.
                    </p>

                    <p>
                        Third, the FLOSSK board and hackerspace coordinators will conduct a thorough investigation of the incident within forty-eight (48) hours. This investigation may include reviewing security camera footage, interviewing witnesses, examining physical evidence, and reviewing relevant logs and records. You will be given an opportunity to provide your account of the incident in writing or in person. Fourth, for serious violations including theft, vandalism, assault, or other criminal activity, we will file a formal report with the Kosovo Police and provide all evidence and documentation to support the investigation. We cooperate fully with law enforcement and judicial proceedings.
                    </p>

                    <p>
                        Fifth, based on the investigation findings, the FLOSSK board will determine the appropriate consequences, which may include a formal warning for minor first-time violations, temporary suspension for a specified period (typically 30-90 days), permanent ban from all FLOSSK facilities and events, or legal action including civil claims for damages. Finally, you will be held financially responsible for any damages, stolen property, or costs incurred as a result of your actions. This may include equipment replacement costs, repair costs, administrative costs, legal fees, and any other expenses reasonably related to the violation. Payment of damages does not preclude other consequences including permanent ban or legal prosecution.
                    </p>

                    <p>
                        All enforcement decisions are final and made at the sole discretion of the FLOSSK board. You may submit a written appeal to info@flossk.org within fourteen (14) days of receiving notice of the decision. Appeals will be reviewed by the full FLOSSK board, and a final decision will be communicated within thirty (30) days. The decision on appeal is final and binding.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">8. Equipment Usage, Training Requirements, and Liability</h2>

                    <p>
                        The Prishtina Hackerspace provides access to a wide range of equipment and tools, some of which can be dangerous if used improperly. To ensure the safety of all members and the proper maintenance of equipment, certain tools and machines require mandatory safety training before use. Equipment requiring training includes, but is not limited to, 3D printers (FDM and resin-based), laser cutting and engraving machines, CNC milling machines, power tools including table saws, drill presses, and angle grinders, soldering stations and reflow ovens, and high-voltage electrical equipment.
                    </p>

                    <p>
                        Training sessions are conducted by certified hackerspace coordinators or experienced members designated as equipment trainers. Training covers proper operation procedures, safety protocols, emergency shutdown procedures, maintenance requirements, and common troubleshooting. You must complete training and receive certification before using restricted equipment. Using equipment without proper training and certification is a serious safety violation and may result in immediate suspension of access privileges.
                    </p>

                    <p>
                        All equipment must be used in accordance with manufacturer instructions, safety guidelines, and hackerspace policies. You are responsible for inspecting equipment before use and reporting any defects, damage, or safety concerns immediately. Do not use equipment that appears damaged or malfunctions during use. After using equipment, you must clean your work area, return tools to their designated storage locations, properly shut down machines, and leave the workspace in better condition than you found it. Failure to clean up or properly store equipment may result in loss of access privileges.
                    </p>

                    <p>
                        If you accidentally damage equipment during normal use, you must report it immediately to a coordinator or via email to info@flossk.org. Accidents happen, and honest reporting of accidental damage will not result in penalties for first-time incidents. However, concealing damage, failing to report damage, or repeatedly damaging equipment due to negligence or improper use may result in financial liability, suspension, or termination of membership. Intentional damage is treated as vandalism as described in Section 7.
                    </p>

                    <p>
                        Members are welcome to work on personal projects using hackerspace equipment and resources. However, commercial use of hackerspace equipment for profit-generating activities requires prior written approval from the FLOSSK board. If you wish to use hackerspace resources for commercial purposes, you must submit a proposal describing the nature of your business, expected equipment usage, and proposed compensation to the hackerspace. Commercial use may require additional fees or revenue-sharing arrangements.
                    </p>

                    <p>
                        Some materials and consumables are provided by the hackerspace for general use, while others may incur additional costs. For example, basic electronic components, solder, and common hardware are typically available for free or minimal cost. However, 3D printing filament, laser cutting materials, specialty components, and bulk materials may be charged at cost or require members to provide their own materials. Current material costs and policies are posted in the hackerspace and available on our website.
                    </p>

                    <p>
                        By using hackerspace equipment, you acknowledge and accept the inherent risks associated with tools and machinery. While we maintain equipment in good working condition and provide safety training, you use all equipment at your own risk. FLOSSK and Prishtina Hackerspace are not liable for injuries resulting from proper use of equipment in accordance with training and safety guidelines. You are responsible for your own safety and the safety of those around you. Always use appropriate personal protective equipment (PPE) including safety glasses, gloves, and hearing protection as required for specific tasks.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">9. Content and Intellectual Property</h2>
                    <p>
                        You retain ownership of content you post (profile information, bio, links). By posting content, you grant us a license to display and use it within the Service. The Service itself, including its design, code, and branding, is owned by FLOSSK and protected by intellectual property laws.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">10. Privacy</h2>
                    <p>
                        Your use of the Service is also governed by our <a href="/privacy" className="text-primary underline">Privacy Policy</a>. Please review it to understand how we collect, use, and protect your data.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">11. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your account at any time for violations of these Terms, illegal activity, or behavior that harms the community. You may also delete your account at any time via your account settings.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">12. Disclaimers</h2>
                    <p>
                        The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation. We are not responsible for content posted by users.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">13. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, FLOSSK and Prishtina Hackerspace shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">14. Changes to Terms</h2>
                    <p>
                        We may update these Terms from time to time. We will notify you of significant changes via email or a prominent notice on the platform. Continued use of the Service after changes constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">15. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of the Republic of Kosovo. Any disputes shall be resolved in the courts of Prishtina, Kosovo. This agreement is subject to Kosovo law including but not limited to the Law on Personal Data Protection (Law No. 06/L-082), the Criminal Code of Kosovo (Law No. 06/L-074), the Law on Safety and Health at Work (Law No. 05/L-021), and the Law on Protection from Discrimination (Law No. 05/L-021).
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">16. Contact Us</h2>
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

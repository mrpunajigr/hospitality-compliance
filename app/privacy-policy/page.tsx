'use client'

import Link from 'next/link'
import { PublicPageBackgroundWithGradient } from '@/app/components/backgrounds/PublicPageBackground'

export default function PrivacyPolicyPage() {
  return (
    <PublicPageBackgroundWithGradient
      backgroundImage="restaurant.jpg"
      gradientStart="rgba(0,0,0,0.7)"
      gradientEnd="rgba(0,0,0,0.8)"
      additionalOverlay="rgba(0,0,0,0.3)"
    >
      <div className="min-h-screen py-12 px-4">
        
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-6">
            <Link 
              href="/"
              className="inline-block mb-6"
            >
              <img 
                src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/JigrLogoStackWhite.png" 
                alt="JiGR Logo" 
                className="h-16 w-auto object-contain mx-auto"
              />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/80 text-lg">
              How we collect, use, and protect your information
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12">
            
            <div className="prose prose-lg max-w-none text-white prose-headings:text-white prose-strong:text-white">
              
              <div className="text-sm text-white/60 mb-8">
                <strong>Last Updated:</strong> October 17, 2025
              </div>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Our Commitment to Privacy</h2>
                <p className="text-white/90 leading-relaxed">
                  JiGR | Modular Hospitality Solution ("JiGR", "we", "us", or "our") is committed to protecting your privacy. 
                  This Privacy Statement explains how we collect, use, disclose, and safeguard your information when you use our 
                  compliance platform and services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
                
                <h3 className="text-lg font-medium text-white mb-3">Information You Provide</h3>
                <ul className="text-white/90 leading-relaxed mb-4 list-disc pl-6">
                  <li><strong>Account Information:</strong> Name, email address, company details, phone number</li>
                  <li><strong>Compliance Data:</strong> Delivery dockets, temperature readings, supplier information, inspection records</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
                  <li><strong>User-Generated Content:</strong> Photos, documents, notes, and other uploaded materials</li>
                </ul>

                <h3 className="text-lg font-medium text-white mb-3">Information Automatically Collected</h3>
                <ul className="text-white/90 leading-relaxed mb-4 list-disc pl-6">
                  <li><strong>Usage Data:</strong> Platform interactions, feature usage, session duration</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, device model, IP address</li>
                  <li><strong>Performance Data:</strong> Error logs, page load times, system diagnostics</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
                <p className="text-white/90 leading-relaxed mb-4">We use collected information to:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li>Provide and maintain our compliance platform services</li>
                  <li>Process document analysis and generate compliance reports</li>
                  <li>Manage your account and subscription billing</li>
                  <li>Respond to customer support requests</li>
                  <li>Improve platform functionality and user experience</li>
                  <li>Send administrative information and service updates</li>
                  <li>Comply with legal and regulatory obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
                <p className="text-white/90 leading-relaxed mb-4">We implement industry-standard security measures including:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest</li>
                  <li><strong>Access Controls:</strong> Role-based access and multi-tenant data isolation</li>
                  <li><strong>Secure Storage:</strong> Enterprise-grade cloud infrastructure (Supabase, Google Cloud)</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability monitoring</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Data Sharing and Disclosure</h2>
                <p className="text-white/90 leading-relaxed mb-4">We do not sell your personal information. We may share data only:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                  <li><strong>Service Providers:</strong> Third-party processors (Google Cloud AI, Stripe) under strict confidentiality agreements</li>
                  <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                  <li><strong>Business Transfers:</strong> In connection with merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                  <li><strong>Compliance Records:</strong> Maintained per regulatory requirements (typically 2-7 years)</li>
                  <li><strong>Deleted Accounts:</strong> Data securely deleted within 90 days of account closure</li>
                  <li><strong>Backups:</strong> May persist in secure backups for up to 30 days</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
                <p className="text-white/90 leading-relaxed mb-4">You have the right to:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li><strong>Access:</strong> Request copies of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                  <li><strong>Portability:</strong> Export your data in standard formats</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Cookies and Tracking</h2>
                <p className="text-white/90 leading-relaxed mb-4">We use essential cookies for:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li>Authentication and session management</li>
                  <li>Platform functionality and preferences</li>
                  <li>Analytics to improve user experience</li>
                </ul>
                <p className="text-white/90 leading-relaxed">
                  You can control cookies through your browser settings. For detailed information, see our 
                  <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline">Cookie Policy</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
                <p className="text-white/90 leading-relaxed mb-4">Our platform integrates with:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li><strong>Google Cloud AI:</strong> Document processing and analysis</li>
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                </ul>
                <p className="text-white/90 leading-relaxed">
                  Each service has its own privacy policy governing their data practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Children's Privacy</h2>
                <p className="text-white/90 leading-relaxed">
                  JiGR is designed for business use. We do not knowingly collect information from individuals under 18 years of age.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">International Data Transfers</h2>
                <p className="text-white/90 leading-relaxed">
                  Your data may be transferred to and processed in countries outside your jurisdiction. We ensure appropriate 
                  safeguards are in place to protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Changes to Privacy Statement</h2>
                <p className="text-white/90 leading-relaxed mb-4">We may update this Privacy Statement periodically. Significant changes will be notified via:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li>Email to registered account holders</li>
                  <li>Platform notifications</li>
                  <li>Updated "Last Updated" date on this page</li>
                </ul>
                <p className="text-white/90 leading-relaxed">
                  Continued use of JiGR services after changes constitutes acceptance of the updated Privacy Statement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
                <p className="text-white/90 leading-relaxed mb-4">
                  For privacy questions, concerns, or requests:
                </p>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <p className="text-white/90 leading-relaxed">
                    <strong>Email:</strong> privacy@jigr.app<br/>
                    <strong>Website:</strong> https://jigr.app<br/>
                    <strong>Address:</strong> [Your Business Address]<br/>
                    <strong>Data Protection Officer:</strong> [Contact if applicable]
                  </p>
                </div>
                <p className="text-white/90 leading-relaxed mt-4">
                  By using JiGR services, you acknowledge that you have read and understood this Privacy Statement.
                </p>
              </section>

            </div>

            {/* Navigation Footer */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link 
                  href="/"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  ← Back to Home
                </Link>
                <div className="flex gap-6 text-sm">
                  <Link 
                    href="/terms-of-service"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <Link 
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-xs">
            © 2025 JiGR | Modular Hospitality Solution
          </p>
        </div>

      </div>
    </PublicPageBackgroundWithGradient>
  )
}
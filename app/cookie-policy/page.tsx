'use client'

import Link from 'next/link'
import { PublicPageBackgroundWithGradient } from '@/app/components/backgrounds/PublicPageBackground'

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-white/80 text-lg">
              How we use cookies and similar technologies
            </p>
          </div>
        </div>

        {/* Cookie Policy Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12">
            
            <div className="prose prose-lg max-w-none text-white prose-headings:text-white prose-strong:text-white">
              
              <div className="text-sm text-white/60 mb-8">
                <strong>Last Updated:</strong> October 17, 2025
              </div>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">What Are Cookies?</h2>
                <p className="text-white/90 leading-relaxed">
                  Cookies are small text files stored on your device when you visit our platform. They help JiGR provide you 
                  with a better, faster, and safer experience.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">How JiGR Uses Cookies</h2>
                <p className="text-white/90 leading-relaxed">
                  We use cookies for essential platform functionality only. We do not use advertising or tracking cookies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Essential Cookies (Required)</h2>
                <p className="text-white/90 leading-relaxed mb-4">
                  These cookies are necessary for the platform to function and cannot be disabled:
                </p>

                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Authentication Cookies</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p><code className="bg-white/10 px-2 py-1 rounded">supabase-auth-token</code></p>
                      <p><strong>Purpose:</strong> Keep you securely logged in</p>
                      <p><strong>Duration:</strong> Session or 7 days (if "Remember Me" selected)</p>
                      <p><strong>Data Stored:</strong> Encrypted authentication token</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Session Management</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p><code className="bg-white/10 px-2 py-1 rounded">session-id</code></p>
                      <p><strong>Purpose:</strong> Maintain your active session</p>
                      <p><strong>Duration:</strong> Until browser closes</p>
                      <p><strong>Data Stored:</strong> Random session identifier</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Security Cookies</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p><code className="bg-white/10 px-2 py-1 rounded">csrf-token</code></p>
                      <p><strong>Purpose:</strong> Prevent cross-site request forgery attacks</p>
                      <p><strong>Duration:</strong> Session</p>
                      <p><strong>Data Stored:</strong> Random security token</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Functional Cookies (Optional)</h2>
                <p className="text-white/90 leading-relaxed mb-4">
                  These cookies enhance your experience but are not essential:
                </p>

                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">User Preferences</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p>
                        <code className="bg-white/10 px-2 py-1 rounded mr-2">theme-preference</code>
                        <code className="bg-white/10 px-2 py-1 rounded mr-2">display-config</code>
                        <code className="bg-white/10 px-2 py-1 rounded">language-setting</code>
                      </p>
                      <p><strong>Purpose:</strong> Remember your display settings, theme choice, and language</p>
                      <p><strong>Duration:</strong> 1 year</p>
                      <p><strong>Data Stored:</strong> Your preference selections</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Local Storage Items</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p>
                        <code className="bg-white/10 px-2 py-1 rounded mr-2">recent-uploads</code>
                        <code className="bg-white/10 px-2 py-1 rounded">dashboard-filters</code>
                      </p>
                      <p><strong>Purpose:</strong> Remember your recent activity and filter selections</p>
                      <p><strong>Duration:</strong> Until cleared</p>
                      <p><strong>Data Stored:</strong> Non-sensitive UI state information</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Analytics Cookies (Optional)</h2>
                <p className="text-white/90 leading-relaxed mb-4">We use minimal analytics to improve the platform:</p>

                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Usage Analytics</h3>
                  <div className="text-sm text-white/80 space-y-2">
                    <p>
                      <code className="bg-white/10 px-2 py-1 rounded mr-2">analytics-consent</code>
                      <code className="bg-white/10 px-2 py-1 rounded">platform-metrics</code>
                    </p>
                    <p><strong>Purpose:</strong> Understand how features are used to improve functionality</p>
                    <p><strong>Duration:</strong> 1 year</p>
                    <p><strong>Data Stored:</strong> Anonymized usage patterns, feature interactions</p>
                    <p><strong>Provider:</strong> Self-hosted analytics (data stays in our infrastructure)</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Third-Party Cookies</h2>
                <p className="text-white/90 leading-relaxed mb-4">Our platform uses services that may set their own cookies:</p>

                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Stripe (Payment Processing)</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p><strong>Purpose:</strong> Secure payment processing and fraud prevention</p>
                      <p><strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">https://stripe.com/privacy</a></p>
                      <p><strong>Control:</strong> Managed by Stripe, essential for billing functionality</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Google Cloud (Document Processing)</h3>
                    <div className="text-sm text-white/80 space-y-2">
                      <p><strong>Purpose:</strong> Document AI processing infrastructure</p>
                      <p><strong>Privacy Policy:</strong> <a href="https://cloud.google.com/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">https://cloud.google.com/privacy</a></p>
                      <p><strong>Control:</strong> Backend processing only, no tracking cookies set</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Cookie Management</h2>
                
                <h3 className="text-lg font-medium text-white mb-3">Browser Controls</h3>
                <p className="text-white/90 leading-relaxed mb-4">You can control cookies through your browser settings:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Chrome</h4>
                    <p className="text-sm text-white/80">Settings &gt; Privacy and Security &gt; Cookies and other site data</p>
                  </div>
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Safari</h4>
                    <p className="text-sm text-white/80">Preferences &gt; Privacy &gt; Manage Website Data</p>
                  </div>
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Firefox</h4>
                    <p className="text-sm text-white/80">Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</p>
                  </div>
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Edge</h4>
                    <p className="text-sm text-white/80">Settings &gt; Cookies and site permissions &gt; Cookies and site data</p>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4 mb-6">
                  <p className="text-orange-200 text-sm">
                    ⚠️ <strong>Note:</strong> Disabling essential cookies will prevent you from using JiGR services.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">What Happens If You Block Cookies?</h2>
                
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Essential Cookies Blocked:</h3>
                    <ul className="text-red-200 text-sm list-disc pl-6">
                      <li>❌ Cannot log in or maintain session</li>
                      <li>❌ Platform will not function properly</li>
                      <li>❌ Security features disabled</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Functional Cookies Blocked:</h3>
                    <ul className="text-yellow-200 text-sm list-disc pl-6">
                      <li>⚠️ Preferences not remembered between sessions</li>
                      <li>⚠️ Must reconfigure settings each visit</li>
                      <li>✅ Core functionality still works</li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Analytics Cookies Blocked:</h3>
                    <ul className="text-green-200 text-sm list-disc pl-6">
                      <li>✅ No impact on functionality</li>
                      <li>ℹ️ Helps us improve the platform, but optional</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Mobile App Considerations</h2>
                <p className="text-white/90 leading-relaxed mb-4">When using JiGR on iPad Air or mobile browsers:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li>Cookies function identically to desktop browsers</li>
                  <li>Settings accessible through device browser settings</li>
                  <li>App-specific storage follows same privacy principles</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Data Protection</h2>
                <p className="text-white/90 leading-relaxed mb-4">All cookies used by JiGR:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li>✅ Are encrypted where they contain sensitive data</li>
                  <li>✅ Use secure transmission (HTTPS only)</li>
                  <li>✅ Follow data minimization principles</li>
                  <li>✅ Comply with privacy regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Your Consent</h2>
                <p className="text-white/90 leading-relaxed mb-4">By using JiGR:</p>
                <ul className="text-white/90 leading-relaxed list-disc pl-6">
                  <li>You consent to essential cookies (required for functionality)</li>
                  <li>You can opt-in or opt-out of optional cookies at any time</li>
                  <li>Your cookie preferences are respected and stored locally</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Questions About Cookies?</h2>
                <p className="text-white/90 leading-relaxed mb-4">For cookie-related questions or concerns:</p>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <p className="text-white/90 leading-relaxed">
                    <strong>Email:</strong> privacy@jigr.app<br/>
                    <strong>Support:</strong> Help Center &gt; Privacy &amp; Security<br/>
                    <strong>Settings:</strong> Access cookie controls in your account settings
                  </p>
                </div>
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
                    href="/privacy-policy"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
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
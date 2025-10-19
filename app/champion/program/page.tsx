'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { PublicPageBackgroundWithGradient } from '@/app/components/backgrounds/PublicPageBackground'

export default function ChampionProgramPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/')
        return
      }

      setUser(session.user)
      
      try {
        const clientInfo = await getUserClient(session.user.id)
        setUserClient(clientInfo)
      } catch (error) {
        console.error('Failed to load user client:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

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
            
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-xl">
              <img 
                src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/trophy.svg"
                alt="Trophy"
                className="w-12 h-12 object-contain"
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              JiGR Heroes Program
            </h1>
            
            <p className="text-white/95 text-lg max-w-2xl mx-auto leading-relaxed">
              Empowering hospitality professionals to become heroes for compliance 
              excellence in their teams.
            </p>
          </div>
        </div>

        {/* Champion Program Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-8 md:p-12">
            
            <div className="prose prose-lg max-w-none text-white prose-headings:text-white prose-strong:text-white">
              
              {/* What is the Champion Program */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">What is the Heroes Program?</h2>
                
                <p className="text-white leading-relaxed mb-6">
                  The JiGR Heroes Program recognizes that in hospitality businesses, the people who 
                  understand operational needs aren't always the business owners. Whether you're a Head Chef, 
                  Operations Manager, or senior team member, you know what your operation needs to succeed.
                </p>
                
                <p className="text-white leading-relaxed mb-6">
                  As a Hero, you get full access to configure JiGR for your business during a 30-day 
                  evaluation period. This lets you demonstrate the real value of compliance management to 
                  decision-makers with a fully customized, working system.
                </p>
              </section>

              {/* Champion Benefits */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Hero Benefits & Rewards</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white/90 mb-3">During Evaluation</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="mr-3 text-blue-400">🔧</span>
                        <div>
                          <div className="font-medium text-white">Full Configuration Access</div>
                          <div className="text-sm text-white/80">Set up departments, job roles, workflows, and all system features</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="mr-3 text-green-400">📊</span>
                        <div>
                          <div className="font-medium text-white">Success Score Tracking</div>
                          <div className="text-sm text-white/80">Gamified progress system with achievements and milestones</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="mr-3 text-purple-400">📧</span>
                        <div>
                          <div className="font-medium text-white">Owner Invitation Tools</div>
                          <div className="text-sm text-white/80">Professional invitation system with ROI calculations</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="mr-3 text-orange-400">📱</span>
                        <div>
                          <div className="font-medium text-white">Real-time Engagement Tracking</div>
                          <div className="text-sm text-white/80">Know when owners open emails and interact with invitations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Hero Rewards</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="mr-3 text-green-400">💰</span>
                        <div>
                          <div className="font-medium text-white">Financial Incentives</div>
                          <div className="text-sm text-white/80">$50 when owner approves, $150 when subscription activates</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="mr-3 text-blue-400">🎓</span>
                        <div>
                          <div className="font-medium text-white">Career Benefits</div>
                          <div className="text-sm text-white/80">Compliance certification, community access, speaking opportunities</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="mr-3 text-purple-400">⭐</span>
                        <div>
                          <div className="font-medium text-white">Power User Status</div>
                          <div className="text-sm text-white/80">Priority support, advanced features, influence on product development</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mr-3 flex-shrink-0">
                          <img 
                            src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/trophy.svg"
                            alt="Trophy"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white">Recognition</div>
                          <div className="text-sm text-white/80">Public recognition, case study features, industry profile building</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Evaluation Process */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">30-Day Evaluation Process</h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">System Setup</h3>
                    <div className="text-3xl font-bold text-blue-400 mb-1">60%</div>
                    <p className="text-sm text-white/80">
                      Configure departments, roles, workflows, and compliance requirements for your operation.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Team Engagement</h3>
                    <div className="text-3xl font-bold text-green-400 mb-1">80%</div>
                    <p className="text-sm text-white/80">
                      Invite team members, track real usage, and demonstrate value to your organization.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Owner Presentation</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-1">30%</div>
                    <p className="text-sm text-white/80">
                      Present ROI analysis to decision-makers with professional invitation tools and engagement tracking.
                    </p>
                  </div>
                </div>
              </section>

              {/* Hero Status */}
              {userClient?.champion_enrolled && (
                <section className="mb-8">
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <img 
                        src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/trophy.svg"
                        alt="Trophy"
                        className="w-8 h-8 object-contain mr-2"
                      />
                      <h3 className="text-xl font-bold text-yellow-300">You're a JiGR Hero!</h3>
                    </div>
                    <p className="text-white/90 mb-4">
                      Welcome to the Heroes Program. You now have access to all evaluation tools and features.
                    </p>
                    <Link
                      href="/admin/console"
                      className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Access Hero Dashboard
                    </Link>
                  </div>
                </section>
              )}

              {/* Getting Started */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Ready to Get Started?</h2>
                
                <p className="text-white leading-relaxed mb-6">
                  The Heroes Program is perfect for hospitality professionals who want to drive positive 
                  change in their organizations. Whether you're looking to streamline compliance, improve 
                  operational efficiency, or advance your career, we provide the tools and support you need.
                </p>
                
                <div className="text-center">
                  <Link
                    href="/register"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
                  >
                    Join the Heroes Program
                  </Link>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </PublicPageBackgroundWithGradient>
  )
}
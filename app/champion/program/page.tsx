'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle } from '@/lib/design-system'
import { ModuleHeader } from '@/app/components/ModuleHeader'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-xl">
            <span className="text-4xl">🏆</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JiGR Champion Program
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Empowering hospitality professionals to evaluate, configure, and champion 
            compliance solutions for their teams.
          </p>
        </div>


        {/* What is the Champion Program */}
        <section className="mb-12">
          <div 
            className="p-8 rounded-xl border bg-white/60 backdrop-blur-sm border-white/30"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">❓</span>
              What is the Champion Program?
            </h2>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The JiGR Champion Program recognizes that in hospitality businesses, the people who 
                understand operational needs aren't always the business owners. Whether you're a Head Chef, 
                Operations Manager, or senior team member, you know what your operation needs to succeed.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                As a Champion, you get full access to configure JiGR for your business during a 30-day 
                evaluation period. This lets you demonstrate the real value of compliance management to 
                decision-makers with a fully customized, working system.
              </p>
            </div>
          </div>
        </section>

        {/* Champion Benefits */}
        <section className="mb-12">
          <div 
            className="p-8 rounded-xl border bg-white/60 backdrop-blur-sm border-white/30"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">✨</span>
              Champion Benefits & Rewards
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">During Evaluation</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600">🔧</span>
                    <div>
                      <div className="font-medium text-gray-900">Full Configuration Access</div>
                      <div className="text-sm text-gray-600">Set up departments, job roles, workflows, and all system features</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-green-600">📊</span>
                    <div>
                      <div className="font-medium text-gray-900">Success Score Tracking</div>
                      <div className="text-sm text-gray-600">Gamified progress system with achievements and milestones</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-purple-600">📧</span>
                    <div>
                      <div className="font-medium text-gray-900">Owner Invitation Tools</div>
                      <div className="text-sm text-gray-600">Professional invitation system with ROI calculations</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-orange-600">📱</span>
                    <div>
                      <div className="font-medium text-gray-900">Real-time Engagement Tracking</div>
                      <div className="text-sm text-gray-600">Know when owners open emails and interact with invitations</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Champion Rewards</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="mr-3 text-green-600">💰</span>
                    <div>
                      <div className="font-medium text-gray-900">Financial Incentives</div>
                      <div className="text-sm text-gray-600">$50 when owner approves, $150 when subscription activates</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600">🎓</span>
                    <div>
                      <div className="font-medium text-gray-900">Career Benefits</div>
                      <div className="text-sm text-gray-600">Compliance certification, community access, speaking opportunities</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-purple-600">⭐</span>
                    <div>
                      <div className="font-medium text-gray-900">Power User Status</div>
                      <div className="text-sm text-gray-600">Priority support, advanced features, influence on product development</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-3 text-red-600">🏆</span>
                    <div>
                      <div className="font-medium text-gray-900">Recognition</div>
                      <div className="text-sm text-gray-600">Public recognition, case study features, industry profile building</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <div 
            className="p-8 rounded-xl border bg-white/60 backdrop-blur-sm border-white/30"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🔄</span>
              How the Champion Process Works
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm mr-4 mt-1">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Evaluate & Configure</h3>
                  <p className="text-gray-700">
                    Spend up to 30 days configuring JiGR to match your operation. Set up departments, 
                    job roles, workflows, and explore all features. Your success score tracks progress.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm mr-4 mt-1">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Invite Business Owner</h3>
                  <p className="text-gray-700">
                    When ready, use our professional invitation system to show the business owner your 
                    configured system. Include ROI calculations and demonstrate real value.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm mr-4 mt-1">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Owner Review & Approval</h3>
                  <p className="text-gray-700">
                    Owners can review your configuration, see the value demonstration, and approve the 
                    system for their business. You'll receive real-time notifications of their engagement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm mr-4 mt-1">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transition & Rewards</h3>
                  <p className="text-gray-700">
                    Upon owner approval, the system transitions from evaluation to production mode. 
                    You receive Champion rewards and maintain power user privileges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Scoring System */}
        <section className="mb-12">
          <div 
            className="p-8 rounded-xl border bg-white/60 backdrop-blur-sm border-white/30"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Champion Success Scoring
            </h2>
            
            <p className="text-gray-700 mb-6">
              Your Champion success score is calculated across three key dimensions, helping you 
              track progress and maximize your evaluation effectiveness.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Configuration Quality</h3>
                <div className="text-3xl font-bold text-blue-600 mb-1">40%</div>
                <p className="text-sm text-gray-600">
                  Departments, job roles, workflows, and feature utilization
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Value Articulation</h3>
                <div className="text-3xl font-bold text-green-600 mb-1">30%</div>
                <p className="text-sm text-gray-600">
                  ROI calculations, business case development, owner engagement
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Evaluation Readiness</h3>
                <div className="text-3xl font-bold text-purple-600 mb-1">30%</div>
                <p className="text-sm text-gray-600">
                  System completeness, testing, documentation, owner invitation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <div 
            className="p-8 rounded-xl border bg-white/60 backdrop-blur-sm border-white/30"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">❓</span>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens after 30 days if the owner doesn't approve?</h3>
                <p className="text-gray-700">
                  Your evaluation access continues until you get a response. We also provide 
                  abandonment recovery tools and follow-up strategies to help re-engage owners.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I make changes after inviting the owner?</h3>
                <p className="text-gray-700">
                  Yes! You maintain full configuration access until owner approval. Our "Champion Panic Button" 
                  even allows quick corrections after owner approval if needed.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if I'm not actually the decision maker?</h3>
                <p className="text-gray-700">
                  Perfect! The Champion Program is designed exactly for this situation. You evaluate and 
                  demonstrate value, then the actual business owner makes the final decision.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do I keep access after owner approval?</h3>
                <p className="text-gray-700">
                  Yes! Champions maintain power user privileges including priority support, advanced features, 
                  and continued influence on product development.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <div 
            className="p-8 rounded-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Champion Your Team's Success?
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Start configuring JiGR for your operation and show your business owner the value 
              of professional compliance management.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/admin/configure')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md"
              >
                Start Configuring
              </button>
              <button
                onClick={() => router.back()}
                className="px-8 py-3 bg-white/80 hover:bg-white text-gray-700 font-medium rounded-lg transition-colors duration-200 border border-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
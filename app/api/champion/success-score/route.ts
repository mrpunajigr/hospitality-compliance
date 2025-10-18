import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * GET /api/champion/success-score
 * Calculate and return champion success score with breakdown
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user client information
    const userClient = await getUserClient(user.id)
    if (!userClient || !userClient.clientId) {
      return NextResponse.json({ error: 'User not associated with a client' }, { status: 403 })
    }

    // Check if user is CHAMPION
    if (userClient.role !== 'CHAMPION') {
      return NextResponse.json({ error: 'Only champions can view success score' }, { status: 403 })
    }

    // Calculate success score
    const successScore = await calculateChampionSuccessScore(user.id, userClient.clientId)

    return NextResponse.json({
      success: true,
      score: successScore.totalScore,
      breakdown: successScore.breakdown,
      recommendations: successScore.recommendations,
      guidance: successScore.guidance
    })

  } catch (error) {
    console.error('Champion success score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Calculate comprehensive champion success score
 */
async function calculateChampionSuccessScore(championId: string, clientId: string) {
  try {
    // Configuration Quality (40 points)
    const configurationQuality = await calculateConfigurationQuality(clientId)
    
    // Value Articulation (30 points)
    const valueArticulation = await calculateValueArticulation(championId, clientId)
    
    // Readiness Indicators (30 points)
    const readinessIndicators = await calculateReadinessIndicators(championId, clientId)

    const totalScore = Math.min(100, configurationQuality + valueArticulation + readinessIndicators)

    // Generate recommendations
    const recommendations = generateRecommendations(
      configurationQuality, 
      valueArticulation, 
      readinessIndicators
    )

    // Generate guidance message
    const guidance = generateGuidanceMessage(totalScore, recommendations)

    // Store score in database
    await storeSuccessScore(championId, clientId, {
      totalScore,
      configurationQuality,
      valueArticulation,
      readinessIndicators
    })

    return {
      totalScore,
      breakdown: {
        configurationQuality: {
          score: configurationQuality,
          maxScore: 40,
          percentage: Math.round((configurationQuality / 40) * 100)
        },
        valueArticulation: {
          score: valueArticulation,
          maxScore: 30,
          percentage: Math.round((valueArticulation / 30) * 100)
        },
        readinessIndicators: {
          score: readinessIndicators,
          maxScore: 30,
          percentage: Math.round((readinessIndicators / 30) * 100)
        }
      },
      recommendations,
      guidance
    }
  } catch (error) {
    console.error('Error calculating champion success score:', error)
    return {
      totalScore: 0,
      breakdown: { error: 'Unable to calculate score' },
      recommendations: ['Contact support for assistance'],
      guidance: 'Unable to calculate success score. Please contact support.'
    }
  }
}

/**
 * Calculate Configuration Quality Score (40 points max)
 */
async function calculateConfigurationQuality(clientId: string): Promise<number> {
  let score = 0

  try {
    // Department setup completeness (15 points)
    const { count: departmentCount } = await supabase
      .from('business_departments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    if (departmentCount && departmentCount >= 3) score += 10 // Basic setup
    if (departmentCount && departmentCount >= 5) score += 5  // Comprehensive setup

    // Job title definitions (15 points)
    const { count: jobTitleCount } = await supabase
      .from('business_job_titles')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    if (jobTitleCount && jobTitleCount >= 4) score += 10 // Basic roles
    if (jobTitleCount && jobTitleCount >= 7) score += 5  // Comprehensive roles

    // Team member additions (10 points)
    const { count: teamMemberCount } = await supabase
      .from('client_users')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'active')

    if (teamMemberCount && teamMemberCount >= 2) score += 5  // Started adding team
    if (teamMemberCount && teamMemberCount >= 4) score += 5  // Good team representation

    return Math.min(40, score)
  } catch (error) {
    console.error('Error calculating configuration quality:', error)
    return 0
  }
}

/**
 * Calculate Value Articulation Score (30 points max)
 */
async function calculateValueArticulation(championId: string, clientId: string): Promise<number> {
  let score = 0

  try {
    // Check for owner invitation data
    const { data: invitation } = await supabase
      .from('owner_invitations')
      .select('evaluation_message, evaluation_summary, include_roi_data')
      .eq('champion_id', championId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (invitation) {
      // Custom evaluation message written (10 points)
      if (invitation.evaluation_message && invitation.evaluation_message.trim().length > 50) {
        score += 10
      }

      // ROI data populated (10 points)
      if (invitation.include_roi_data && invitation.evaluation_summary) {
        score += 10
      }

      // Evaluation summary quality (10 points)
      if (invitation.evaluation_summary) {
        const summary = invitation.evaluation_summary as any
        if (summary.configurationProgress && summary.estimatedValue && summary.readinessScore) {
          score += 10
        }
      }
    }

    return Math.min(30, score)
  } catch (error) {
    console.error('Error calculating value articulation:', error)
    return 0
  }
}

/**
 * Calculate Readiness Indicators Score (30 points max)
 */
async function calculateReadinessIndicators(championId: string, clientId: string): Promise<number> {
  let score = 0

  try {
    // Owner invitation drafted (15 points)
    const { data: invitation } = await supabase
      .from('owner_invitations')
      .select('id, owner_name, email, status')
      .eq('champion_id', championId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (invitation) {
      score += 10 // Invitation exists
      
      // Owner profile completeness (5 points)
      if (invitation.owner_name && invitation.email) {
        score += 5
      }

      // Timeline set (5 points)
      // Check if timeline was provided in invitation
      score += 5 // Assuming timeline was set if invitation exists

      // Follow-up plan (5 points)
      if (invitation.status === 'pending') {
        score += 5 // Active invitation shows follow-up planning
      }
    }

    return Math.min(30, score)
  } catch (error) {
    console.error('Error calculating readiness indicators:', error)
    return 0
  }
}

/**
 * Generate improvement recommendations
 */
function generateRecommendations(
  configQuality: number, 
  valueArticulation: number, 
  readiness: number
): string[] {
  const recommendations: string[] = []

  // Configuration recommendations
  if (configQuality < 30) {
    if (configQuality < 15) {
      recommendations.push('Add more departments to better represent your business structure (+15pts)')
    }
    if (configQuality < 25) {
      recommendations.push('Define additional job titles and assign security levels (+10pts)')
    }
    if (configQuality < 35) {
      recommendations.push('Invite more team members to demonstrate real-world usage (+5pts)')
    }
  }

  // Value articulation recommendations
  if (valueArticulation < 25) {
    if (valueArticulation < 10) {
      recommendations.push('Write a personal evaluation message for the owner (+10pts)')
    }
    if (valueArticulation < 20) {
      recommendations.push('Enable ROI data in your owner invitation (+10pts)')
    }
    if (valueArticulation < 30) {
      recommendations.push('Complete your business configuration to improve evaluation summary (+5pts)')
    }
  }

  // Readiness recommendations
  if (readiness < 25) {
    if (readiness < 10) {
      recommendations.push('Draft and send your owner invitation (+15pts)')
    }
    if (readiness < 20) {
      recommendations.push('Complete owner profile information (+5pts)')
    }
    if (readiness < 30) {
      recommendations.push('Set a decision timeline with your owner (+5pts)')
    }
  }

  return recommendations
}

/**
 * Generate guidance message based on score
 */
function generateGuidanceMessage(score: number, recommendations: string[]): string {
  if (score >= 90) {
    return "Excellent setup! You're ready to invite the owner with confidence. Your configuration demonstrates clear value."
  } else if (score >= 75) {
    return "Almost ready! Your setup looks great. Complete the remaining items for maximum impact."
  } else if (score >= 60) {
    return `Good progress! Your success score: ${score}/100. Focus on: ${recommendations.slice(0, 2).join(', ')}`
  } else {
    return `Your success score: ${score}/100. Improve by: ${recommendations.slice(0, 3).join(', ')}`
  }
}

/**
 * Store success score in database
 */
async function storeSuccessScore(
  championId: string, 
  clientId: string, 
  scores: {
    totalScore: number
    configurationQuality: number
    valueArticulation: number
    readinessIndicators: number
  }
) {
  try {
    await supabase
      .from('champion_success_scores')
      .upsert({
        champion_id: championId,
        client_id: clientId,
        score: scores.totalScore,
        configuration_quality: scores.configurationQuality,
        value_articulation: scores.valueArticulation,
        readiness_indicators: scores.readinessIndicators,
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'champion_id,client_id',
        ignoreDuplicates: false
      })
  } catch (error) {
    console.error('Error storing success score:', error)
    // Don't throw - score calculation failure shouldn't break the API
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'

/**
 * GET /api/champion/incentives
 * Get champion's incentive status and achievements
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
      return NextResponse.json({ error: 'Only champions can view incentives' }, { status: 403 })
    }

    // Get champion's incentive data
    const incentiveData = await getChampionIncentives(user.id, userClient.clientId)

    return NextResponse.json({
      success: true,
      ...incentiveData
    })

  } catch (error) {
    console.error('Champion incentives API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/champion/incentives/claim
 * Claim available incentive rewards
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { incentiveType, incentiveId } = body

    // Process incentive claim
    const claimResult = await processIncentiveClaim(user.id, userClient.clientId, incentiveType, incentiveId)

    return NextResponse.json({
      success: claimResult.success,
      message: claimResult.message,
      reward: claimResult.reward
    })

  } catch (error) {
    console.error('Champion incentive claim API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Get comprehensive champion incentive data
 */
async function getChampionIncentives(championId: string, clientId: string) {
  try {
    // Get champion's current progress
    const progress = await getChampionProgress(championId, clientId)
    
    // Get earned achievements
    const achievements = await getChampionAchievements(championId, clientId)
    
    // Get available rewards
    const availableRewards = await getAvailableRewards(championId, clientId, progress)
    
    // Get conversion incentives
    const conversionIncentives = await getConversionIncentives(championId, clientId)

    return {
      immediateValue: {
        earlyAccess: true, // Champions get beta features
        professionalDevelopment: progress.configurationComplete ? 'Compliance Certification Credits Available' : 'Complete setup to unlock',
        personalBrand: progress.ownerApproved ? 'Featured Case Study Eligible' : 'Owner approval needed'
      },
      
      achievements: achievements,
      
      availableRewards: availableRewards,
      
      conversionIncentives: conversionIncentives,
      
      postHandoffValue: {
        retainedPrivileges: progress.ownerApproved ? 'Power User Status Granted' : 'Available after handoff',
        prioritySupport: 'Direct Product Team Access',
        voiceInRoadmap: progress.feedbackProvided ? 'Feature Vote Credits: 3' : 'Provide feedback to unlock'
      },
      
      progressMetrics: progress
    }
  } catch (error) {
    console.error('Error getting champion incentives:', error)
    return {
      error: 'Unable to load incentive data',
      immediateValue: {},
      achievements: [],
      availableRewards: [],
      conversionIncentives: {},
      postHandoffValue: {},
      progressMetrics: {}
    }
  }
}

/**
 * Get champion's current progress metrics
 */
async function getChampionProgress(championId: string, clientId: string) {
  try {
    // Get configuration progress
    const { count: departmentCount } = await supabase
      .from('business_departments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    const { count: jobTitleCount } = await supabase
      .from('business_job_titles')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('is_active', true)

    const { count: teamMemberCount } = await supabase
      .from('client_users')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'active')

    // Get owner invitation status
    const { data: invitation } = await supabase
      .from('owner_invitations')
      .select('status, created_at, responded_at')
      .eq('champion_id', championId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get success score
    const { data: successScore } = await supabase
      .from('champion_success_scores')
      .select('score')
      .eq('champion_id', championId)
      .eq('client_id', clientId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return {
      departmentsConfigured: departmentCount || 0,
      jobTitlesConfigured: jobTitleCount || 0,
      teamMembersAdded: teamMemberCount || 0,
      configurationComplete: (departmentCount || 0) >= 3 && (jobTitleCount || 0) >= 4,
      ownerInvitationSent: !!invitation,
      ownerResponded: invitation?.status !== 'pending',
      ownerApproved: invitation?.status === 'accepted',
      successScore: successScore?.score || 0,
      feedbackProvided: false, // TODO: Implement feedback tracking
      daysActive: invitation ? Math.floor((new Date().getTime() - new Date(invitation.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
    }
  } catch (error) {
    console.error('Error getting champion progress:', error)
    return {}
  }
}

/**
 * Get champion's earned achievements
 */
async function getChampionAchievements(championId: string, clientId: string) {
  try {
    const achievements = []
    const progress = await getChampionProgress(championId, clientId)

    // Configuration achievements
    if ((progress.departmentsConfigured ?? 0) >= 3) {
      achievements.push({
        id: 'departments_configured',
        title: '🏢 Department Architect',
        description: 'Configured business departments',
        earnedAt: new Date().toISOString(),
        value: 'Professional recognition'
      })
    }

    if ((progress.jobTitlesConfigured ?? 0) >= 4) {
      achievements.push({
        id: 'job_titles_configured',
        title: '👥 Team Builder',
        description: 'Defined job titles and roles',
        earnedAt: new Date().toISOString(),
        value: 'Leadership credential'
      })
    }

    // Engagement achievements
    if (progress.ownerInvitationSent) {
      achievements.push({
        id: 'owner_invited',
        title: '👑 Champion Advocate',
        description: 'Successfully invited business owner',
        earnedAt: new Date().toISOString(),
        value: '$50 account credit'
      })
    }

    if (progress.successScore >= 90) {
      achievements.push({
        id: 'excellence_score',
        title: '🏆 Excellence Champion',
        description: 'Achieved 90+ success score',
        earnedAt: new Date().toISOString(),
        value: 'Priority support access'
      })
    }

    if (progress.ownerApproved) {
      achievements.push({
        id: 'successful_handoff',
        title: '🚀 Success Story',
        description: 'Owner approved and activated',
        earnedAt: new Date().toISOString(),
        value: '$150 bonus + case study feature'
      })
    }

    return achievements
  } catch (error) {
    console.error('Error getting champion achievements:', error)
    return []
  }
}

/**
 * Get available rewards champion can claim
 */
async function getAvailableRewards(championId: string, clientId: string, progress: any) {
  try {
    const rewards = []

    // Configuration completion rewards
    if (progress.configurationComplete && !progress.ownerInvitationSent) {
      rewards.push({
        id: 'setup_complete_bonus',
        title: 'Setup Completion Bonus',
        description: '$25 account credit for completing configuration',
        type: 'credit',
        value: 25,
        claimable: true
      })
    }

    // Early adopter rewards
    if (progress.daysActive <= 7 && progress.successScore >= 75) {
      rewards.push({
        id: 'early_adopter',
        title: 'Early Adopter Badge',
        description: 'Completed high-quality setup within first week',
        type: 'badge',
        value: 'Professional recognition',
        claimable: true
      })
    }

    // Success milestone rewards
    if (progress.successScore >= 95) {
      rewards.push({
        id: 'perfection_bonus',
        title: 'Perfection Bonus',
        description: 'Achieved near-perfect evaluation setup',
        type: 'credit',
        value: 50,
        claimable: true
      })
    }

    return rewards
  } catch (error) {
    console.error('Error getting available rewards:', error)
    return []
  }
}

/**
 * Get conversion incentives based on progress
 */
async function getConversionIncentives(championId: string, clientId: string) {
  try {
    // Get owner invitation status for conversion tracking
    const { data: invitation } = await supabase
      .from('owner_invitations')
      .select('status')
      .eq('champion_id', championId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return {
      referralBonus: {
        ownerApproval: {
          amount: '$50',
          status: invitation?.status === 'accepted' ? 'earned' : 'pending',
          description: 'Credit when owner approves evaluation'
        },
        firstSubscription: {
          amount: '$150',
          status: 'pending', // TODO: Track subscription status
          description: 'Bonus when owner activates subscription'
        },
        multiLocationDeal: {
          amount: '2% of first year revenue',
          status: 'pending',
          description: 'Revenue share for multi-location deals'
        }
      },
      
      careerBenefits: {
        skillRecognition: {
          title: 'JiGR Certified Champion',
          status: invitation?.status === 'accepted' ? 'earned' : 'pending',
          description: 'LinkedIn badge and professional certification'
        },
        industryNetwork: {
          title: 'Champion Community Access',
          status: 'active',
          description: 'Private Slack channel with other champions'
        },
        thoughtLeadership: {
          title: 'Guest Content Opportunities',
          status: invitation?.status === 'accepted' ? 'available' : 'pending',
          description: 'Blog posts, webinars, and speaking opportunities'
        }
      }
    }
  } catch (error) {
    console.error('Error getting conversion incentives:', error)
    return {}
  }
}

/**
 * Process incentive claim
 */
async function processIncentiveClaim(championId: string, clientId: string, incentiveType: string, incentiveId: string) {
  try {
    // Validate incentive is claimable
    const progress = await getChampionProgress(championId, clientId)
    const availableRewards = await getAvailableRewards(championId, clientId, progress)
    
    const reward = availableRewards.find(r => r.id === incentiveId)
    if (!reward || !reward.claimable) {
      return {
        success: false,
        message: 'Reward not available or already claimed'
      }
    }

    // TODO: Implement actual reward processing (credits, badges, etc.)
    // For now, just log the claim
    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        user_id: championId,
        action: 'incentive_claimed',
        resource_type: 'champion_incentive',
        resource_id: incentiveId,
        details: {
          incentiveType,
          rewardValue: reward.value,
          claimedAt: new Date().toISOString()
        }
      })

    return {
      success: true,
      message: `${reward.title} claimed successfully!`,
      reward: reward
    }
  } catch (error) {
    console.error('Error processing incentive claim:', error)
    return {
      success: false,
      message: 'Failed to claim reward'
    }
  }
}
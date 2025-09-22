/**
 * Onboarding progress tracking utilities
 */

import { supabase } from '@/lib/supabase'

export type OnboardingStep = 'signup' | 'profile' | 'company' | 'complete'

export interface OnboardingProgress {
  id: string
  userId: string
  currentStep: OnboardingStep
  formData: Record<string, any>
  completedSteps: OnboardingStep[]
  startedAt: string
  updatedAt: string
  completedAt?: string
}

/**
 * Get user's current onboarding progress
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching onboarding progress:', error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      currentStep: data.current_step,
      formData: data.form_data || {},
      completedSteps: data.completed_steps || [],
      startedAt: data.started_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at
    }
  } catch (error) {
    console.error('Exception in getOnboardingProgress:', error)
    return null
  }
}

/**
 * Update user's onboarding progress
 */
export async function updateOnboardingProgress(
  userId: string, 
  step: OnboardingStep, 
  formData: Record<string, any> = {}
): Promise<boolean> {
  try {
    // Determine completed steps based on current step
    const stepOrder: OnboardingStep[] = ['signup', 'profile', 'company', 'complete']
    const currentIndex = stepOrder.indexOf(step)
    const completedSteps = stepOrder.slice(0, currentIndex + 1)

    const updateData = {
      user_id: userId,
      current_step: step,
      form_data: formData,
      completed_steps: completedSteps,
      updated_at: new Date().toISOString(),
      ...(step === 'complete' && { completed_at: new Date().toISOString() })
    }

    const { error } = await supabase
      .from('user_onboarding_progress')
      .upsert(updateData, { onConflict: 'user_id' })

    if (error) {
      console.error('Error updating onboarding progress:', error)
      return false
    }

    console.log(`✅ Onboarding progress updated: ${step}`)
    return true
  } catch (error) {
    console.error('Exception in updateOnboardingProgress:', error)
    return false
  }
}

/**
 * Check if user has completed onboarding
 */
export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const progress = await getOnboardingProgress(userId)
  return progress?.currentStep === 'complete' || false
}

/**
 * Get next onboarding step for user
 */
export async function getNextOnboardingStep(userId: string): Promise<OnboardingStep | null> {
  const progress = await getOnboardingProgress(userId)
  
  if (!progress) {
    return 'signup'
  }

  const stepOrder: OnboardingStep[] = ['signup', 'profile', 'company', 'complete']
  const currentIndex = stepOrder.indexOf(progress.currentStep)
  
  if (currentIndex < stepOrder.length - 1) {
    return stepOrder[currentIndex + 1]
  }
  
  return null // Onboarding complete
}

/**
 * Get onboarding completion percentage
 */
export async function getOnboardingCompletionPercentage(userId: string): Promise<number> {
  const progress = await getOnboardingProgress(userId)
  
  if (!progress) {
    return 0
  }

  const totalSteps = 4 // signup, profile, company, complete
  const completedCount = progress.completedSteps.length
  
  return Math.round((completedCount / totalSteps) * 100)
}

/**
 * Auto-save form data during onboarding
 */
export async function autoSaveOnboardingData(
  userId: string,
  step: OnboardingStep,
  partialData: Record<string, any>
): Promise<void> {
  try {
    const currentProgress = await getOnboardingProgress(userId)
    const existingData = currentProgress?.formData || {}
    
    const mergedData = {
      ...existingData,
      [step]: {
        ...existingData[step],
        ...partialData
      }
    }

    await updateOnboardingProgress(userId, step, mergedData)
  } catch (error) {
    console.warn('Auto-save failed:', error)
    // Don't throw - auto-save failing shouldn't break the flow
  }
}

/**
 * Resume onboarding from last step
 */
export function getOnboardingResumeUrl(progress: OnboardingProgress | null): string {
  if (!progress) {
    return '/create-account'
  }

  switch (progress.currentStep) {
    case 'signup':
      return '/create-account'
    case 'profile':
      return '/onboarding/complete'
    case 'company':
      return '/admin/console?onboarding=company-setup'
    case 'complete':
      return '/admin/console'
    default:
      return '/create-account'
  }
}
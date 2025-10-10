// lib/auth-helpers.ts
import { supabase, setIntentionalSignOut } from './supabase'

/**
 * Properly sign out user with intentional redirect to landing page
 */
export const signOut = async () => {
  try {
    // Mark this as an intentional sign-out
    setIntentionalSignOut(true)
    
    // Perform the sign-out
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      setIntentionalSignOut(false)
      throw error
    }
    
    // The redirect will happen automatically from the auth listener
  } catch (error) {
    console.error('Failed to sign out:', error)
    setIntentionalSignOut(false)
    throw error
  }
}
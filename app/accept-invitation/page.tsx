'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Redirect component for old accept-invitation route
function RedirectToAccept() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      router.replace(`/accept?token=${token}`)
    } else {
      router.replace('/accept')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="absolute inset-0 bg-black/24" />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Redirecting...</h1>
          <p className="text-white/70">Taking you to the invitation page...</p>
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitationRedirect() {
  return <RedirectToAccept />
}
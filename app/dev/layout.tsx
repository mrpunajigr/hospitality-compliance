'use client'

import { DevAuthProvider } from '@/lib/dev-auth-context'

export default function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DevAuthProvider>
      {children}
    </DevAuthProvider>
  )
}
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function TestResetContent() {
  const searchParams = useSearchParams()
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl mb-4">Test Reset Page</h1>
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-lg mb-2">URL Parameters:</h2>
        <pre className="text-sm">
          {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <h2 className="text-lg mb-2">Full URL:</h2>
        <p className="text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
      </div>
    </div>
  )
}

export default function TestResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestResetContent />
    </Suspense>
  )
}
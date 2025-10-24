'use client'

export default function AdminBackgroundTest() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Admin Background Test</h1>
      <div className="bg-white/10 p-6 rounded-lg">
        <p className="text-white">
          This page should show the admin background (Home-Chef-Chicago-8.webp).
        </p>
        <p className="text-white mt-2">
          URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
        </p>
      </div>
    </div>
  )
}
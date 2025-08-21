'use client'

export default function HomePage() {
  const currentBackground = 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${currentBackground}')`,
          filter: 'brightness(0.6)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <img 
              src="/JiGR_Logo-full_figma_circle.png" 
              alt="JiGR Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Hospitality Compliance
          </h1>
          
          <p className="text-white/70 text-sm mb-8">
            AI-powered food safety compliance platform
          </p>
          
          <div className="space-y-4">
            <a
              href="/console/dashboard"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 block shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              ACCESS DEMO
            </a>
            
            <a
              href="/signin"
              className="w-full bg-white/15 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 block border border-white/30 backdrop-blur-lg"
            >
              SIGN IN
            </a>
            
            <a
              href="/create-account"
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              Create Account
            </a>
          </div>
          
          <p className="text-xs text-white/50 mt-6">v1.8.19</p>
        </div>
        
      </div>
      </div>
    </div>
  )
}
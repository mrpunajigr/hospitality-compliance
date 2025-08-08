export default function CompanySettingsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/hero-image.jpg')`,
          filter: 'brightness(0.6)'
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Company Settings
              </h1>
              <p className="text-white/70 text-sm">
                Manage your company configuration and preferences
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Demo Mode
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Company Settings</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Company Name</label>
                  <input
                    type="text"
                    defaultValue="Demo Restaurant Ltd"
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Industry Type</label>
                  <select className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Café</option>
                    <option value="hotel">Hotel</option>
                    <option value="catering">Catering</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Compliance Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Temperature Monitoring</label>
                  <p className="text-white/80 text-sm">Enable automatic temperature alerts</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Daily Reports</label>
                  <p className="text-white/80 text-sm">Generate daily compliance reports</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <button className="bg-white/20 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm">
              Cancel
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Save Changes
            </button>
          </div>
          
          {/* Version */}
          <div className="text-center mt-8">
            <span className="text-white/60 text-sm">v1.8.6</span>
          </div>

        </div>
      </div>
    </div>
  )
}
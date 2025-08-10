export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">HC</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hospitality Compliance
          </h1>
          
          <p className="text-gray-600 mb-8">
            AI-powered food safety compliance platform
          </p>
          
          <div className="space-y-4">
            <a
              href="/workspace/dashboard"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 block"
            >
              ACCESS DEMO
            </a>
            
            <a
              href="/signin"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 block"
            >
              SIGN IN
            </a>
            
            <a
              href="/create-account"
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Create Account
            </a>
          </div>
          
          <p className="text-xs text-gray-400 mt-6">v1.8.8</p>
        </div>
      </div>
    </div>
  )
}
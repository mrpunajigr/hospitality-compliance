export default function HomePage() {
  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Hospitality Compliance
        </h1>
        
        <p className="text-gray-600 mb-6">
          AI-powered food safety compliance platform
        </p>
        
        <div className="space-y-3">
          <a
            href="/upload/console"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
          >
            ACCESS DEMO
          </a>
          
          <a
            href="/signin"
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors block"
          >
            SIGN IN
          </a>
          
          <a
            href="/simple"
            className="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            Test Simple Page
          </a>
        </div>
      </div>
    </div>
  )
}
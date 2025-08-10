export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-lg">If you can see this, the server is working!</p>
        <div className="mt-8">
          <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Go to Home
          </a>
        </div>
      </div>
    </div>
  )
}
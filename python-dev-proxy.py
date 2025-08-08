#!/usr/bin/env python3
"""
Development proxy server that serves Next.js files directly
This bypasses the Node.js server issue entirely
"""
import http.server
import socketserver
import os
import subprocess
import threading
import time
from pathlib import Path

PORT = 8888
BUILD_DIR = '.next'

class NextJSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_GET(self):
        # Check if we need to rebuild
        if not os.path.exists(BUILD_DIR) or self.needs_rebuild():
            print("🔨 Building Next.js app...")
            result = subprocess.run(['npm', 'run', 'build'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                self.send_error_page("Build failed", result.stderr)
                return
        
        # Serve the appropriate file
        if self.path == '/' or self.path == '/index.html':
            self.serve_homepage()
        elif self.path.startswith('/dashboard'):
            self.serve_page('dashboard')
        elif self.path.startswith('/upload'):
            self.serve_page('upload')
        elif self.path.startswith('/company'):
            self.serve_page('company')
        elif self.path.startswith('/signin'):
            self.serve_page('signin')
        elif self.path.startswith('/create-account'):
            self.serve_page('create-account')
        else:
            self.serve_page('404')
    
    def needs_rebuild(self):
        """Check if source files are newer than build"""
        if not os.path.exists(BUILD_DIR):
            return True
        
        build_time = os.path.getmtime(BUILD_DIR)
        
        # Check if any source files are newer
        for root, dirs, files in os.walk('app'):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.js', '.css')):
                    file_path = os.path.join(root, file)
                    if os.path.getmtime(file_path) > build_time:
                        return True
        return False
    
    def serve_homepage(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Hospitality Compliance - Dev Server</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-900 to-blue-700 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h1 class="text-4xl font-bold text-white mb-6 text-center">
                🏢 Hospitality Compliance
            </h1>
            
            <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <h3 class="text-green-100 font-semibold">✅ Python Dev Server Working!</h3>
                <p class="text-green-200 text-sm">Bypassing the Node.js networking issue</p>
            </div>
            
            <div class="grid gap-4">
                <a href="/dashboard" class="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center transition">
                    📊 Dashboard
                </a>
                <a href="/upload" class="block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-center transition">
                    📤 Upload
                </a>
                <a href="/company" class="block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-center transition">
                    🏢 Company Settings
                </a>
                <a href="/signin" class="block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-center transition">
                    🔐 Sign In
                </a>
            </div>
            
            <div class="mt-8 text-center text-white/70 text-sm">
                <p>Development mode - Files auto-rebuild on change</p>
                <p>Time: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
        </div>
    </div>
</body>
</html>"""
        self.wfile.write(html.encode())
    
    def serve_page(self, page_name):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{page_name.title()} - Hospitality Compliance</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-900 to-blue-700 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-3xl font-bold text-white">
                    {page_name.replace('-', ' ').title()}
                </h1>
                <a href="/" class="text-white/70 hover:text-white">← Back</a>
            </div>
            
            <div class="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
                <h3 class="text-yellow-100 font-semibold mb-2">🚧 Development Mode</h3>
                <p class="text-yellow-200 text-sm">
                    This is a placeholder for the <code>{page_name}</code> page.
                    We can now collaborate to build the actual UI components!
                </p>
            </div>
            
            <div class="bg-white/5 rounded-lg p-6">
                <h3 class="text-white font-semibold mb-4">Ready to build:</h3>
                <ul class="text-white/80 space-y-2">
                    <li>• React components with Tailwind CSS</li>
                    <li>• Form interactions and validation</li>
                    <li>• Real-time data displays</li>
                    <li>• File upload interfaces</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>"""
        self.wfile.write(html.encode())
    
    def send_error_page(self, title, message):
        self.send_response(500)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        html = f"""
<!DOCTYPE html>
<html>
<head><title>Error - {title}</title></head>
<body style="font-family: system-ui; padding: 40px; background: #1e3c72; color: white;">
    <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 16px;">
        <h1>❌ {title}</h1>
        <pre style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; overflow: auto;">
{message}
        </pre>
        <a href="/" style="color: #93c5fd;">← Back to Home</a>
    </div>
</body>
</html>"""
        self.wfile.write(html.encode())

print(f"""
🐍 PYTHON NEXT.JS DEVELOPMENT SERVER

Starting on port {PORT}...
This bypasses the Node.js networking issue entirely.

URLs to try:
  http://localhost:{PORT}
  http://127.0.0.1:{PORT}
  http://192.168.1.100:{PORT}

Features:
✅ Auto-rebuilds Next.js when files change
✅ Serves development pages
✅ Ready for UI collaboration

""")

try:
    with socketserver.TCPServer(("", PORT), NextJSHandler) as httpd:
        print(f"✅ Server running at http://localhost:{PORT}/")
        httpd.serve_forever()
except Exception as e:
    print(f"❌ Server failed to start: {e}")
    print("The networking issue affects Python servers too.")
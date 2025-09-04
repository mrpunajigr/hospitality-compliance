#!/usr/bin/env python3
import socket
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error

class TunnelHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Try to connect to the Next.js server on localhost:3000
            nextjs_url = f"http://127.0.0.1:3000{self.path}"
            
            req = urllib.request.Request(nextjs_url)
            
            # Copy headers from original request
            for header_name, header_value in self.headers.items():
                if header_name.lower() not in ['host', 'connection']:
                    req.add_header(header_name, header_value)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                # Send response status
                self.send_response(response.status)
                
                # Copy response headers
                for header_name, header_value in response.headers.items():
                    if header_name.lower() not in ['connection', 'transfer-encoding']:
                        self.send_header(header_name, header_value)
                self.end_headers()
                
                # Send response body
                content = response.read()
                self.wfile.write(content)
                
        except urllib.error.URLError as e:
            self.send_error(503, f"Next.js server not reachable: {e}")
        except Exception as e:
            self.send_error(500, f"Tunnel error: {e}")
    
    def do_POST(self):
        self.do_GET()  # Handle POST same as GET for simplicity
    
    def log_message(self, format, *args):
        print(f"[TUNNEL] {format % args}")

def check_nextjs_server():
    """Check if Next.js server is running"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('127.0.0.1', 3000))
            return result == 0
    except:
        return False

def start_tunnel():
    print("🔗 Hospitality Compliance - Dev Server Tunnel")
    print("=" * 50)
    
    # Check if Next.js is running
    if check_nextjs_server():
        print("✅ Next.js server detected on port 3000")
    else:
        print("❌ Next.js server not found on port 3000")
        print("Please make sure 'npm run dev' is running first")
        return
    
    # Start tunnel server
    PORT = 5000
    try:
        server = HTTPServer(('127.0.0.1', PORT), TunnelHandler)
        print(f"\n🚀 Tunnel server started!")
        print(f"📱 Access your app at: http://localhost:{PORT}")
        print(f"🔗 Tunneling to: http://127.0.0.1:3000")
        print(f"\n📋 Routes to test:")
        print(f"   http://localhost:{PORT}/ - Landing page")
        print(f"   http://localhost:{PORT}/workspace/dashboard - Main dashboard")
        print(f"   http://localhost:{PORT}/admin/company - Admin panel")
        print(f"\nPress Ctrl+C to stop the tunnel")
        print("=" * 50)
        
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Tunnel stopped")
    except Exception as e:
        print(f"❌ Tunnel error: {e}")
        # Try alternative port
        PORT = 5001
        try:
            server = HTTPServer(('127.0.0.1', PORT), TunnelHandler)
            print(f"🔄 Trying port {PORT}...")
            print(f"📱 Access your app at: http://localhost:{PORT}")
            server.serve_forever()
        except Exception as e2:
            print(f"❌ Alternative port failed: {e2}")

if __name__ == "__main__":
    start_tunnel()
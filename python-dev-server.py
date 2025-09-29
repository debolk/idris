#!/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(script_dir, "public"))
print(f"Current working directory: {os.getcwd()}")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If path is like "/person", try "/person.html"
        if not os.path.splitext(self.path)[1]:  # No file extension
            
            if "?" in self.path:
                possible_html = self.path.split("?")[0] + ".html"
                if os.path.exists(os.path.join(self.directory, possible_html.strip("/"))):
                    self.path = possible_html + '?' + self.path.split("?")[1]
            else:
                possible_html = self.path + ".html"

                if os.path.exists(os.path.join(self.directory, possible_html.strip("/"))):
                    self.path = possible_html


        return super().do_GET()

if __name__ == "__main__":
    handler = CustomHandler
    handler.directory = "."  # Serve from current directory

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving on http://localhost:{PORT}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            httpd.shutdown()

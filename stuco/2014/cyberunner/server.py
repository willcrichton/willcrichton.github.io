import sys
from SimpleHTTPServer import SimpleHTTPRequestHandler
import BaseHTTPServer


def serve(HandlerClass=SimpleHTTPRequestHandler,
         ServerClass=BaseHTTPServer.HTTPServer):

    protocol = "HTTP/1.0"
    server_address = ('127.0.0.1', 8888)

    HandlerClass.protocol_version = protocol
    httpd = ServerClass(server_address, HandlerClass)

    sa = httpd.socket.getsockname()
    print "Serving HTTP on", sa[0], "port", sa[1], "..."
    httpd.serve_forever()

if __name__ == "__main__":
    serve()


import socket
import threading
import os
import ssl
from .utils import send_response
from .api_endpoints.router import handle_routing
from .api_endpoints.user_endpoints import upload_profile_pic
from concurrent.futures import ThreadPoolExecutor


keyPath = './assets/privkey.pem'
certPath = './assets/fullchain.pem'


class webserver:
    def __init__(self, host='0.0.0.0', port=8080):

        self.use_ssl = os.environ.get("DEPLOYED") == "true"

        if self.use_ssl:
            self.ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            self.ssl_context.load_cert_chain(certfile=certPath, keyfile=keyPath)

        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.host = host
        self.port = port
        self.server_socket.bind((host, port))
        self.server_socket.listen(1000)
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.running = True

    def run(self):
        print(f"*** Server running on {self.host}:{self.port}, serving '/epoch' ***\n")

        try:
            while self.running:

                try:
                    conn, addr = self.server_socket.accept()
                    if self.use_ssl:
                        conn = self.ssl_context.wrap_socket(conn, server_side=True)

                    self.executor.submit(self.handle_request, conn, addr)
                except Exception as e:
                    print(f"Error handling request: {e}")

        except KeyboardInterrupt:
            print("\n*** Server terminated by user. ***\n")

        except Exception as e:
            print(f"*** Server terminated unexpectedly: {e} ***\n")

        finally:
            self.stop()

    def handle_request(self, conn, addr):
        try:
            conn.settimeout(None)
            request_data = conn.recv(1048576)

            if request_data.startswith(b"POST /api/upload/profile/1/"):
                upload_profile_pic(conn, request_data)
            else:
                request_data = request_data.decode('UTF-8')
                request_lines = request_data.split('\r\n')
                request_line = request_lines[0]
                method, relative_path, _ = request_line.split(' ')
                print(f"Heard:\n{request_data}\n")
                handle_routing(relative_path, request_data, conn, method)

        except Exception as e:
            print(f"Error handling request from {addr}: {e}")
            send_response(conn, 500, "Internal Server Error", body=b"<h1>500 Internal Server Error</h1>")
            return

    def stop(self):
        try:
            print("Stopping webserver...")
            self.running = False
            self.executor.shutdown(wait=True)
            self.server_socket.close()

        except Exception as e:
            print(f"Error while stopping the server: {e}")



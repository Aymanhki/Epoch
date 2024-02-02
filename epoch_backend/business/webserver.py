import math
import socket
import threading
from business.utils import send_response
from business.api_endpoints.router import handle_routing
from business.api_endpoints.user_endpoints import upload_file

class webserver:
    def __init__(self, host='0.0.0.0', port=8080):
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((host, port))
        self.server_socket.listen(40)
        self.active_threads = []
        self.thread_lock = threading.Lock()

    def run(self, host, port):
        print(f"*** Server running on {host}:{port}, serving '/epoch' ***\n")

        try:
            while True:
                conn, addr = self.server_socket.accept()
                thread = threading.Thread(target=self.handle_request, args=(conn, addr))

                with self.thread_lock:
                    self.active_threads.append(thread)

                thread.start()
                self.cleanup_threads()

        except KeyboardInterrupt:
            print("\n*** Server terminated by user. ***\n")

        finally:
            self.cleanup_threads()
            self.server_socket.close()

    def handle_request(self, conn, addr):
        try:
            conn.settimeout(16800)
            request_data = conn.recv(1048576)

            if request_data.startswith(b"POST /api/upload"):
                upload_file(conn, request_data) # we don't decode the request_data here because the file uploaded is received in binary
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

    def cleanup_threads(self):
        with self.thread_lock:
            for thread in self.active_threads:
                if not thread.is_alive():
                    self.active_threads.remove(thread)

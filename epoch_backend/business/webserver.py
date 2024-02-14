import socket
import threading
import os
import ssl
from .utils import send_response
from .api_endpoints.router import handle_routing
from .api_endpoints.user_endpoints import upload_profile_pic

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
        self.active_threads = []
        self.thread_lock = threading.Lock()
        self.running = True

    def run(self):
        print(f"*** Server running on {self.host}:{self.port}, serving '/epoch' ***\n")

        try:
            while self.running:
                try:
                    conn, addr = self.server_socket.accept()
                    if self.use_ssl:
                        conn = self.ssl_context.wrap_socket(conn, server_side=True)

                    new_thread = threading.Thread(target=self.handle_request, args=(conn, addr), daemon=True)

                    with self.thread_lock:
                        self.active_threads.append(new_thread)

                    new_thread.start()
                    self.cleanup_threads()
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
            print(f"Connected by {addr}")
            conn.settimeout(None)
            request_data = conn.recv(1024)
            print(f"Heard:\n{request_data}\n")

            if request_data.startswith(b"POST /api/upload/profile/1/"):
                upload_profile_pic(conn, request_data)
            else:
                request_data = request_data.decode('UTF-8')
                request_lines = request_data.split('\r\n')
                request_line = request_lines[0]
                method, relative_path, _ = request_line.split(' ')

                handle_routing(relative_path, request_data, conn, method)

        except Exception as e:
            print(f"Error handling request from {addr}: {e}")
            send_response(conn, 500, "Internal Server Error", body=b"<h1>500 Internal Server Error</h1>")

    def cleanup_threads(self):
        with self.thread_lock:
            for thread in self.active_threads:
                if not thread.is_alive():
                    thread.join()

            num_threads_before_cleanup = len(self.active_threads)
            self.active_threads = [thread for thread in self.active_threads if thread.is_alive()]
            num_threads_after_cleanup = len(self.active_threads)
            closed_thread_position = num_threads_before_cleanup - num_threads_after_cleanup

            if closed_thread_position > 0:
                print(f"Closed thread at position {closed_thread_position}.")
            print(f"Total alive threads: {num_threads_after_cleanup}")


    def stop(self):
        try:
            print("Stopping webserver...")
            self.running = False
            self.cleanup_threads()
            self.active_threads.clear()
            self.server_socket.shutdown(socket.SHUT_RDWR)
            print("Server stopped.")

        except Exception as e:
            print(f"Error while stopping the server: {e}")

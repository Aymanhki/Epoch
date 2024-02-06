from business.webserver import webserver, http_server
from business.utils import start_db_tables, get_google_credentials
import threading

def main():
    start_db_tables()
    get_google_credentials()
    web_server_instance = webserver()
    http_server_instance = http_server()

    while True:
        web_server_thread = threading.Thread(target=web_server_instance.run)
        http_server_thread = threading.Thread(target=http_server_instance.run)

        try:
            web_server_thread.start()
            http_server_thread.start()

            web_server_thread.join()
            http_server_thread.join()

        except KeyboardInterrupt:
            webserver().stop()
            http_server().stop()
            break

        except Exception as e:
            print(f"Exception: {e}")
            webserver().stop()
            http_server().stop()


if __name__ == "__main__":
    main()

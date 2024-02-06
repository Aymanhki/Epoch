from business.webserver import webserver, http_server
from business.utils import start_db_tables, get_google_credentials
import threading

def main():
    start_db_tables()
    get_google_credentials()

    web_server_thread = threading.Thread(target=webserver().run)
    http_server_thread = threading.Thread(target=http_server().run)

    try:
        web_server_thread.start()
        http_server_thread.start()

        web_server_thread.join()
        http_server_thread.join()
    except KeyboardInterrupt:
        webserver().stop()
        http_server().stop()

if __name__ == "__main__":
    main()

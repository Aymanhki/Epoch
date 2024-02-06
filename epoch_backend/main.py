from business.webserver import webserver
from business.utils import start_db_tables, get_google_credentials
import threading

def main():
    start_db_tables()
    get_google_credentials()
    webserver().run()

if __name__ == "__main__":
    main()

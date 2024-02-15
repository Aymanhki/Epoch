import os
import sys

os.chdir(os.path.dirname(os.path.realpath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from business.webserver import webserver
from business.utils import start_db_tables, get_google_credentials


def main():
    start_db_tables()
    get_google_credentials()   
    webserver().run()

if __name__ == "__main__":
    main()

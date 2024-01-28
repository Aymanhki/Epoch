from epoch_backend.business.webserver import webserver
from epoch_backend.business.utils import start_db_tables


def main():
    start_db_tables()
    webserver().run()

if __name__ == "__main__":
    main()


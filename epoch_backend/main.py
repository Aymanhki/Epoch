from epoch_backend.business.webserver import webserver
from epoch_backend.business.utils import start_db_tables

def main():
    start_db_tables()
    webserver(host='0.0.0.0', port=8080).run(host='0.0.0.0', port=8080)

if __name__ == "__main__":
    main()


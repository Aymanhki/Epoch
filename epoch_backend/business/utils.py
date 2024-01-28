import datetime
import os
import pytz
import json
import psycopg2

def send_response(conn, status_code, reason_phrase, body=b"", headers={}):
    try:
        response_line = f"HTTP/1.1 {status_code} {reason_phrase}\r\n"
        response_headers = headers
        response_headers["Content-Length"] = len(body)
        response_headers_str = "\r\n".join([f"{header}: {value}" for header, value in response_headers.items()])
        response = f"{response_line}{response_headers_str}\r\n\r\n".encode('utf-8') + body
        conn.sendall(response)
    finally:
        conn.close()

def get_last_modified(file_path):
    last_updated_pattern = "%a, %d %b %Y %H:%M:%S %Z"
    modified_timestamp = os.path.getmtime(file_path)
    modified_time = datetime.datetime.fromtimestamp(modified_timestamp, tz=pytz.timezone("America/Winnipeg"))
    return modified_time.strftime(last_updated_pattern)

def guess_file_type(file_extension):
    extension_to_type = {
        ".html": "text/html",
        ".txt": "text/plain",
        ".json": "application/json",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".css": "text/css",
        ".js": "application/javascript",
        ".java": "text/x-java-source,java",
        ".py": "text/x-python",
        ".c": "text/x-c",
        ".cpp": "text/x-c",
        ".h": "text/x-c",
        ".hpp": "text/x-c",
        ".hxx": "text/x-c",
        ".hs": "text/x-haskell",
        ".pdf": "application/pdf",
        ".mp3": "audio/mpeg",
        ".mp4": "video/mp4",
        ".ico": "image/x-icon",
        ".svg": "image/svg+xml",
        ".xml": "application/xml",
        ".zip": "application/zip",
        ".gz": "application/gzip",
        ".tar": "application/x-tar",
        ".tgz": "application/x-tar",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".webm": "video/webm",
        ".webp": "image/webp",
        ".csv": "text/csv",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".rtf": "application/rtf",
        ".epub": "application/epub+zip",
        ".apk": "application/vnd.android.package-archive",
        ".exe": "application/octet-stream",
        ".iso": "application/octet-stream",
        ".img": "application/octet-stream",
        ".msi": "application/octet-stream",
    }

    # If the file extension is not in the mapping, default to text/text the second parameter is supposed to be
    # the encoding of the file/folder because it is expected by header 'Content-Type' in the response header
    return extension_to_type.get(file_extension, "text/text"), file_extension

def is_session_valid( request_data, sessions):
    headers = request_data.split('\r\n\r\n')[0]

    for line in headers.split('\r\n'):
        if line.startswith("Cookie:"):
            cookies = line.split(":", 1)[1].strip().split(";")
            for cookie in cookies:
                if cookie.strip().startswith("session_id="):
                    session_id = cookie.split('=')[1]
                    return session_id in sessions
    return False


def get_db_connection():
    try:
        with open("./assets/db_params.json", "r") as f:
            db_params = json.load(f)
            f.close()

        connection = psycopg2.connect(
            host=db_params["host"],
            port=db_params["port"],
            dbname=db_params["database"],
            user=db_params["user"],
            password=db_params["password"],
            connect_timeout=db_params["connect_timeout"]
        )

        return connection

    except Exception as e:
        print(e)
        raise e


def start_db_tables():
    try:
        with open("./assets/epoch_db.sql", "r") as f:
            epoch_tables = f.read()
            f.close()

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(epoch_tables)
        connection.commit()
        cursor.close()
        connection.close()


    except Exception as e:
        print(e)
        raise e
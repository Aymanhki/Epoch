import datetime
import os
import pytz
import json
import psycopg2
from google.cloud import storage
from urllib.parse import urlparse, unquote


BUCKET_NAME = "epoch-cloud"

# Set the current working directory to the root of your project
assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets'))
db_params_path = os.path.join(assets_dir, "db_params.json")
epoch_db_path = os.path.join(assets_dir, "epoch_db.sql")


def send_response(conn, status_code, reason_phrase, body=b"", headers={}):
    print(f"Sent:\n{status_code} {reason_phrase}\n{headers}\n{body[:1000]}")

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
    file_extension = file_extension.lower()
    return extension_to_type.get(file_extension, "text/text"), file_extension


def get_session_id_from_request( request_data):
    headers = request_data.split('\r\n\r\n')[0]

    for line in headers.split('\r\n'):
        if line.startswith("Cookie:"):
            cookies = line.split(":", 1)[1].strip().split(";")
            for cookie in cookies:
                if cookie.strip().startswith("epoch_session_id="):
                    session_id = cookie.split('=')[1]
                    return session_id
    return None


def get_db_connection():
    try:
        with open(db_params_path, "r") as f:
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
        with open(epoch_db_path, "r") as f:
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


def send_cors_options_response(request_data, conn):
    headers, body = request_data.split("\r\n\r\n", 1)
    origin = get_origin_from_headers(headers)
    send_response(conn, 204, "No Content", body=b"", headers=get_cors_headers(origin))


def get_cors_headers(origin="*"):
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Set-Cookie, Authorization, File-Name, User-Id, X-Requested-With, X-HTTP-Method-Override, Accept, Origin, X-Custom-Header, Cache-Control, X-File-Name, X-File-Size, X-File-Type, X-File-Last-Modified, X-File-Chunk-Number, X-File-Total-Chunks",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Requested-Headers": "Content-Type, Set-Cookie, Authorization, File-Name, User-Id, X-Requested-With, X-HTTP-Method-Override, Accept, Origin, X-Custom-Header, Cache-Control, X-File-Name, X-File-Size, X-File-Type, X-File-Last-Modified, X-File-Chunk-Number, X-File-Total-Chunks",
    }


def get_origin_from_headers(headers):
    headers_list = headers.split("\r\n")
    origin_line = None

    for line in headers_list:
        if line.startswith("Origin: "):
            origin_line = line
            break

    if origin_line:
        origin = origin_line.split(": ")[1]
        return origin
    else:
        print("Origin header not found.")


def upload_file_to_cloud(user_id, file_name, file, content_type):
    path = ''

    if user_id is not None:
        path = f"epoch-media/users/{user_id}/{file_name}"
    else:
        path = f"epoch-media/{file_name}"

    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)

    blob = bucket.blob(path)
    blob.upload_from_string(file, content_type=content_type)

    file_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{path}"
    client.close()

    return file_url


def download_file_to_cloud(file_url):
    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)
    parsed_url = urlparse(file_url)
    object_path = unquote(parsed_url.path.lstrip('/'))
    object_path = object_path.replace(f"{BUCKET_NAME}/", "")

    blob = bucket.blob(object_path)
    file = blob.download_as_bytes()
    client.close()

    return file


def is_file_in_bucket(file_path):
    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)
    parsed_url = urlparse(file_path)
    object_path = unquote(parsed_url.path.lstrip('/'))
    object_path = object_path.replace(f"{BUCKET_NAME}/", "")

    blob = bucket.blob(object_path)
    blob_exists = blob.exists()
    client.close()

    return blob_exists


def delete_file_from_bucket(file_path):
    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)
    parsed_url = urlparse(file_path)
    object_path = unquote(parsed_url.path.lstrip('/'))
    object_path = object_path.replace(f"{BUCKET_NAME}/", "")

    blob = bucket.blob(object_path)
    blob.delete()
    client.close()


def get_google_credentials():
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(assets_dir, "epoch-414600-66dd2b7c57f6.json")


def get_fullchain_cert_path():
    return os.path.join(assets_dir, "fullchain.pem")


def get_privkey_cert_path():
    return os.path.join(assets_dir, "privkey.pem")

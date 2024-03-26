from datetime import datetime, timedelta
import os
import pytz
import json
import psycopg2
from google.cloud import storage
from urllib.parse import urlparse, unquote
import subprocess
import signal

BUCKET_NAME = "epoch-cloud-storage-media"

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
    except Exception as e:
        print(f"Error sending response: {e}")
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


def get_session_id_from_request(request_data):
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
        "Access-Control-Allow-Headers": "Content-Type, Set-Cookie, Authorization, File-Name, User-Id, X-Requested-With, X-HTTP-Method-Override, Accept, Origin, X-Custom-Header, Cache-Control, X-File-Name, X-File-Size, X-File-Type, X-File-Last-Modified, X-File-Chunk-Number, X-File-Total-Chunks, Content-Length, Hashtag, Post-Id, Comment-Id, Vote, Notif-Id, Limit, Offset, Session-Id",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Requested-Headers": "Content-Type, Set-Cookie, Authorization, File-Name, User-Id, X-Requested-With, X-HTTP-Method-Override, Accept, Origin, X-Custom-Header, Cache-Control, X-File-Name, X-File-Size, X-File-Type, X-File-Last-Modified, X-File-Chunk-Number, X-File-Total-Chunks, Content-Length, Hashtag, Post-Id, Comment-Id, Vote, Notif-Id, Limit, Offset, Session-Id",
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


def upload_file_to_cloud(username, file_name, file, content_type):
    path = ''

    if username is not None:
        path = f"epoch-media/users/{username}/{file_name}"
    else:
        path = f"epoch-media/{file_name}"

    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)

    blob = bucket.blob(path)
    file_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{path}"

    if not is_file_in_bucket(file_url):
        blob.upload_from_string(file, content_type=content_type, timeout=100000)

    client.close()

    return file_url


def download_file_from_cloud(file_url):
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
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(assets_dir, "virtual-bonito-412515-d7dae3104a12.json")


def get_fullchain_cert_path():
    return os.path.join(assets_dir, "fullchain.pem")


def get_privkey_cert_path():
    return os.path.join(assets_dir, "privkey.pem")


def terminate_processes_on_port(port):
    try:
        process = subprocess.Popen(['lsof', '-ti', f':{port}'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = process.communicate()
        process_ids = out.decode().split()

        for pid in process_ids:
            os.kill(int(pid), signal.SIGTERM)

    except Exception as e:
        print(f"Error terminating processes on port {port}: {e}")


def get_posts_media(posts):
    connection = get_db_connection()
    cursor = connection.cursor()
    posts_media = {}

    for i in range(len(posts)):
        if posts[i][2] is not None:
            media_id = posts[i][2]
            cursor.execute("SELECT * FROM media_content WHERE media_id=%s", (media_id,))
            post_media = cursor.fetchone()
            posts_media[i] = post_media

    connection.close()

    return posts_media

def get_profile_info(user_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
    user = cursor.fetchone()
    username = user[2]

    if user[5] is None:
        profile_picture_id = 1
    else:
        profile_picture_id = user[5]

    cursor.execute("SELECT * FROM media_content WHERE media_id=%s", (profile_picture_id,))
    profile_picture = cursor.fetchone()
    connection.close()
    profile_picture_type = profile_picture[1]
    profile_picture_url = profile_picture[5]
    profile_picture_name = profile_picture[2]

    return username, profile_picture_url, profile_picture_type, profile_picture_name


def get_posts_users_info(posts):
    posts_users = {}

    for i in range(len(posts)):
        user_id = posts[i][1]
        posts_users[i] = get_profile_info(user_id)

    return posts_users


def get_post_dict(current_post, posts_media, username, profile_picture_url, profile_picture_type, profile_picture_name,
                  i):
    post_dict = {}
    post_dict["post_id"] = current_post[0]
    post_dict["profile_picture"] = profile_picture_url
    post_dict["profile_picture_type"] = profile_picture_type
    post_dict["profile_picture_name"] = profile_picture_name
    post_dict["username"] = username
    post_dict["caption"] = current_post[3]
    post_dict["created_at"] = current_post[4].isoformat()
    post_dict["release"] = current_post[5].isoformat()
    post_dict["time_zone"] = current_post[8]

    if current_post[2] is not None:
        post_media = posts_media.get(i)
        post_media = post_media[5]

        post_dict["file_type"] = posts_media.get(i)[1]
        post_dict["file_name"] = posts_media.get(i)[2]
        post_dict["file"] = post_media
    else:
        post_dict["file"] = None
        post_dict["file_name"] = None

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT favorites.user_id, users.username FROM favorites left join users on favorites.user_id=users.user_id WHERE post_id=%s", (current_post[0],))
    favorites = cursor.fetchall()
    cursor.execute("SELECT votes.user_id, votes.vote, users.username FROM votes left join users on votes.user_id=users.user_id WHERE post_id=%s", (current_post[0],))
    votes = cursor.fetchall()

    connection.close()
    post_dict["favorited_by"] = [favorite[0] for favorite in favorites]
    post_dict["favorited_by_count"] = len(post_dict["favorited_by"])

    post_dict["favorited_by_usernames"] = [{"user_id": favorite[0], "username": favorite[1]} for favorite in favorites]
    post_dict["votes_by_usernames"] = [{"user_id": vote[0], "vote": vote[1], "username": vote[2]} for vote in votes]
    post_dict["votes"] = {vote[0]: vote[1] for vote in votes}
    post_dict["votes_count"] = len(post_dict["votes"])

    return post_dict


def get_comment_dict(curr_comment, username, profile_picture_url, profile_picture_type, profile_picture_name):
    comment_dict = {}
    comment_dict["comm_id"] = curr_comment[0]
    comment_dict["post_id"] = curr_comment[1]
    comment_dict["profile_picture"] = profile_picture_url
    comment_dict["profile_picture_type"] = profile_picture_type
    comment_dict["profile_picture_name"] = profile_picture_name
    comment_dict["username"] = username
    comment_dict["comment"] = curr_comment[3]
    comment_dict["created_at"] = curr_comment[4].strftime("%Y-%m-%d %H:%M:%S")

    return comment_dict
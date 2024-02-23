import datetime
import json
from ..utils import send_response, get_cors_headers, get_origin_from_headers, upload_file_to_cloud, download_file_from_cloud, is_file_in_bucket
from ..db_controller.access_user_persistence import access_user_persistence
from ..db_controller.access_media_persistence import access_media_persistence
from ..db_controller.access_post_persistence import access_post_persistence
from ..db_controller.access_session_persistence import access_session_persistence
from epoch_backend.objects.session import session
from epoch_backend.objects.media import media
from epoch_backend.objects.user import user
from epoch_backend.objects.post import post
import uuid
import base64

def new_post(conn, request_data):
    headers, body = request_data.split('\r\n\r\n', 1)

    content_length = 0

    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])
            break

    origin = get_origin_from_headers(headers)
    conn.settimeout(3)
    try:
        while len(body) < content_length:
            data = conn.recv(1048576).decode('UTF-8')
            if not data:
                break
            body += data
    except Exception as e:
        pass

    conn.settimeout(None)
    data = json.loads(body)
    username = data.get("username")
    file_name = data.get("fileName")
    file_type = data.get("fileType")
    file_base64 = data.get("file")
    post_now = data.get("postNow")
    post_text = data.get("postText")
    selected_date = data.get("selectedDate")
    user_fetch = access_user_persistence().get_user(username)

    # date format is "2024-02-22T06:36:12.653Z"
    selected_date = datetime.datetime.strptime(selected_date, "%Y-%m-%dT%H:%M:%S.%fZ")

    if user_fetch:
        user_id = user_fetch.id
        if file_base64:
            file_bytes = base64.b64decode(file_base64)
            path = upload_file_to_cloud(username, file_name, file=file_bytes, content_type=file_type)
            media_id = access_media_persistence().add_media(media(file_type, file_name, user_id, path))
            file_uploaded = is_file_in_bucket(path)

            if media_id is not None and file_uploaded:
                new_post = post(user_id, media_id, post_text, selected_date, None)
                access_post_persistence().add_post(new_post)
                send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
            else:
                send_response(conn, 500, "Internal Server Error", b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))
        else:
            new_post = post(user_id, None, post_text, selected_date, None)
            access_post_persistence().add_post(new_post)
            send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 404, "Could not find the username you are trying to post", b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))


def get_all_user_posts(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    user_id = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])
            break

    origin = get_origin_from_headers(headers)

    if user_id is not None:
        posts = access_post_persistence().get_all_user_posts(user_id)
        send_response(conn, 200, "OK", json.dumps(posts).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


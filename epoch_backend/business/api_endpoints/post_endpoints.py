from datetime import datetime
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
    created_at = data.get("createdAt")
    user_fetch = access_user_persistence().get_user(username)

    # date format is "2024-02-22T06:36:12.653Z"
    selected_date = datetime.fromisoformat(selected_date.replace('Z', '+00:00'))

    if user_fetch:
        user_id = user_fetch.id
        if file_base64:
            file_bytes = base64.b64decode(file_base64)
            path = upload_file_to_cloud(username, file_name, file=file_bytes, content_type=file_type)
            media_id = access_media_persistence().add_media(media(file_type, file_name, user_id, path))
            file_uploaded = is_file_in_bucket(path)

            if media_id is not None and file_uploaded:
                new_post = post(user_id, media_id, post_text, selected_date, created_at)
                access_post_persistence().add_post(new_post)
                send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
            else:
                send_response(conn, 500, "Internal Server Error", b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))
        else:
            new_post = post(user_id, None, post_text, selected_date, created_at)
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


def get_all_hashtag_posts(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    hashtag = None
    content_length = 0

    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])
        elif "Hashtag" in line:
            hashtag = line.split(" ")[1]

    origin = get_origin_from_headers(headers)


    if hashtag is not None:
        posts = access_post_persistence().get_all_hashtag_posts(hashtag)
        send_response(conn, 200, "OK", json.dumps(posts).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


def delete_post(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    post_id = None
    user_id = None

    for line in headers.split("\r\n"):
        if "Post-Id" in line:
            post_id = int(line.split(" ")[1])
        elif "User-Id" in line:
            user_id = int(line.split(" ")[1])

    origin = get_origin_from_headers(headers)

    if post_id is not None and user_id is not None:
        post_fetch = access_post_persistence().get_post(post_id)
        if post_fetch is not None:
            if post_fetch[1] == user_id:
                access_post_persistence().remove_post(post_id)
                send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
            else:
                send_response(conn, 401, "This user is not authorised to delete this post", b"<h1>401 Unauthorized</h1>", headers=get_cors_headers(origin))
        else:
            send_response(conn, 404, "The post you are trying to delete is not found", b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Your request is either missing the post id or the user id", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


def update_post(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    user_id = None
    content_length = 0

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])
        elif "Content-Length" in line:
            content_length = int(line.split(" ")[1])

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
    post_id = data.get("postId")
    username = data.get("username")
    file_name = data.get("fileName")
    file_type = data.get("fileType")
    file_base64 = data.get("file")
    post_now = data.get("postNow")
    post_text = data.get("postText")
    selected_date = data.get("selectedDate")
    created_at = data.get("createdAt")
    oldeFileRemoved = bool(data.get("oldFileRemoved"))
    user_fetch = access_user_persistence().get_user(username)


    if user_fetch and user_fetch.id == user_id:
        if file_base64:
            file_bytes = base64.b64decode(file_base64)
            path = upload_file_to_cloud(username, file_name, file=file_bytes, content_type=file_type)
            media_id = access_media_persistence().add_media(media(file_type, file_name, user_id, path))
            file_uploaded = is_file_in_bucket(path)

            if media_id is not None and file_uploaded:
                new_post = post(user_id, media_id, post_text, selected_date, created_at)
                access_post_persistence().update_post(post_id, new_post)
                send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
            else:
                send_response(conn, 500, "Internal Server Error", b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))

        elif oldeFileRemoved:
            new_post = post(user_id, None, post_text, selected_date, created_at)
            access_post_persistence().update_post(post_id, new_post)
            send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
        else:
            new_post = post(user_id, -1, post_text, selected_date, created_at)
            access_post_persistence().update_post(post_id, new_post)
            send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 404, "Could not find the username you are trying to update their post", b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))


def get_followed_users_posts(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    user_id = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])

    origin = get_origin_from_headers(headers)

    if user_id is not None:
        posts = access_post_persistence().get_followed_users_posts(user_id)
        send_response(conn, 200, "OK", json.dumps(posts).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


def favorite_post(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    user_id = None
    post_id = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])
        elif "Post-Id" in line:
            post_id = int(line.split(" ")[1])

    origin = get_origin_from_headers(headers)

    if user_id is not None and post_id is not None:
        access_post_persistence().favorite_post(post_id, user_id)
        send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))



def remove_favorite_post(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    user_id = None
    post_id = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])
        elif "Post-Id" in line:
            post_id = int(line.split(" ")[1])

    origin = get_origin_from_headers(headers)

    if user_id is not None and post_id is not None:
        access_post_persistence().remove_favorite_post(post_id, user_id)
        send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


def get_favorites(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    user_id = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])

    origin = get_origin_from_headers(headers)

    if user_id is not None:
        posts = access_post_persistence().get_favorites(user_id)
        send_response(conn, 200, "OK", json.dumps(posts).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))

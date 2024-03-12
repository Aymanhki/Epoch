from datetime import datetime
import json
from ..utils import send_response, get_cors_headers, get_origin_from_headers, upload_file_to_cloud, download_file_from_cloud, is_file_in_bucket
from ..db_controller.access_comment_persistence import access_comment_persistence
from ..db_controller.access_user_persistence import access_user_persistence
from ..db_controller.access_post_persistence import access_post_persistence
from epoch_backend.objects.comment import comment
import base64


def new_comment(conn, request_data):
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
    post_id = data.get("post_id")
    comment_text = data.get("comment")
    created_at = data.get("createdAt")
    user_fetch = access_user_persistence().get_user(username)

    if user_fetch:
        user_id = user_fetch.id
        new_comment = comment(user_id, post_id, comment_text, created_at)
        access_comment_persistence.create_comment(new_comment)
        send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 404, "Could not post a comment for this username", b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))


def delete_comment(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    post_id = None
    user_id = None
    comm_id = None

    for line in headers.split("\r\n"):
        if "Post-Id" in line:
            post_id = int(line.split(" ")[1])
        elif "User-Id" in line:
            user_id = int(line.split(" ")[1])
        elif "Comment-Id" in line:
            comm_id = int(line.split(" ")[1])
    
    origin = get_origin_from_headers(headers)

    if post_id is not None and user_id is not None and comm_id is not None:
        comment_fetch = access_comment_persistence.get_comment(comm_id)
        if comment_fetch is not None:
            if comment_fetch[1] == post_id and comment_fetch[2] == user_id:
                access_comment_persistence.delete_comment(comm_id)
                send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
            else:
                send_response(conn, 401, "This user is not authorised to delete this comment", b"<h1>401 Unauthorized</h1>", headers=get_cors_headers(origin))
        else:
            send_response(conn, 404, "The comment you are trying to delete is not found", b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Your request is either missing the post id or the user id or comm id", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))

def get_all_comments_post(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    post_id = None

    for line in headers.split("\r\n"):
        if "Post-Id" in line:
            post_id = int(line.split(" ")[1])
    
    origin = get_origin_from_headers(headers)

    if post_id is not None:
        
        post_fetch = access_post_persistence().get_post(post_id)

        if post_fetch is not None:
            comments_fetch = access_comment_persistence().get_comments_for_post(post_id)
            post_and_comments = {
                "post": post_fetch,
                "comments": comments_fetch
            }
            send_response(conn, 200, "OK", json.dumps(post_and_comments).encode('UTF-8'), headers=get_cors_headers(origin))
        else:
            send_response(conn, 404, "The post you are trying to fetch comments for does not exist", b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Bad Request", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))

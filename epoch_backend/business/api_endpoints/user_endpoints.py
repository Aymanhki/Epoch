import datetime
import json
from ..utils import send_response, get_cors_headers, get_origin_from_headers, upload_file_to_cloud, download_file_to_cloud, is_file_in_bucket
from ..db_controller.access_user_persistence import access_user_persistence
from ..db_controller.access_media_persistence import access_media_persistence
from ..db_controller.access_session_persistence import access_session_persistence
from epoch_backend.objects.session import session
from epoch_backend.objects.media import media
from epoch_backend.objects.user import user
import uuid
import base64

def post_user(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)  # Split request data into headers and body

    content_length = 0

    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')

    data = json.loads(body)  # Parse the JSON body
    username = data.get("username")  # Get the username from the JSON body
    password = data.get("password")  # Get the password from the JSON body
    origin = get_origin_from_headers(headers)

    if access_user_persistence().validate_login(username, password):
        session_id = str(uuid.uuid4())
        user = access_user_persistence().get_user(username)
        access_session_persistence().add_session(session(session_id, user.id))

        if user.profile_pic_id is None:
            access_user_persistence().update_user_profile_pic(user.id, 1)

        headers = {
            "Set-Cookie": f"epoch_session_id={session_id}; Expires={datetime.datetime.now() + datetime.timedelta(days=1)}; username={username}; Path=/",
        }

        headers.update(get_cors_headers(origin))

        send_response(conn, 200, "OK", body=f"epoch_session_id={session_id}".encode('UTF-8'), headers=headers)
    else:
        send_response(conn, 401, "Username or password does not exist", body=b"<h1>401 Unauthorized</h1>", headers=get_cors_headers(origin))

def get_user(conn, request_data, session_id):
    headers, body = request_data.split("\r\n\r\n", 1)

    content_length = 0

    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')

    origin = get_origin_from_headers(headers)
    headers = get_cors_headers(origin)
    session_fetch = access_session_persistence().get_session(session_id)

    if session_fetch is not None:
        user_id = session_fetch[0].user_id
        user_fetch = access_user_persistence().get_user_by_id(user_id)

        if user_fetch is not None and user_fetch.__dict__ is not None and len(user_fetch.__dict__) > 0:
            profile_pic_data = access_media_persistence().get_media(user_fetch.profile_pic_id)

            if profile_pic_data is not None:
                if  is_file_in_bucket(profile_pic_data.path):
                    profile_pic_data = download_file_to_cloud(profile_pic_data.path)
                else:
                    profile_pic_data = download_file_to_cloud(access_media_persistence().get_media(1).path)

                profile_pic_data_base64 = base64.b64encode(bytes(profile_pic_data)).decode('utf-8')
                user_info_with_pic = user_fetch.__dict__
                user_info_with_pic["profile_pic_data"] = profile_pic_data_base64
                send_response(conn, 200, "OK", body=json.dumps(user_info_with_pic).encode('UTF-8'), headers=headers)
            else:
                send_response(conn, 200, "OK, but did not find profile picture for the user", body=json.dumps(user_fetch.__dict__).encode('UTF-8'), headers=headers)
        else:
            send_response(conn, 404, "Could not get the user information because the user was not found", body=b"<h1>404 Not Found</h1>", headers=headers)
    else:
        send_response(conn, 401, "Could not find a valid session for the user you are trying to fetch information for", body=b"<h1>401 Unauthorized</h1>", headers=headers)

def register_user(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)

    content_length = 0

    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')


    data = json.loads(body)
    username = data.get("username")
    password = data.get("password")
    bio = data.get("bio")
    name = data.get("name")
    origin = get_origin_from_headers(headers)

    if access_user_persistence().get_user(username) is None:
        new_user = user(None, name, username, password, bio, None, None)
        user_id = access_user_persistence().add_user(new_user)

        if user_id is not None:
            send_response(conn, 200, "OK", body=json.dumps({"user_id": user_id}).encode('UTF-8'), headers=get_cors_headers(origin))
        else:
            send_response(conn, 500, "Could not register user, internal Server Error", body=b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 409, "Username already exist", body=b"<h1>409 Conflict</h1>", headers=get_cors_headers(origin))

def upload_profile_pic(conn, request_data):
    headers, body = request_data.split(b'\r\n\r\n', 1)
    print(f"Heard:\n{headers}\n")
    header_lines = headers.decode('UTF-8').split('\r\n')

    content_length = None
    user_id = None
    content_type = None
    file_name = None

    for line in header_lines:
        if line.startswith('Content-Length:'):
            content_length = int(line.split(': ')[1])
        elif line.startswith('User-Id:'):
            user_id = line.split(': ')[1].strip()
        elif line.startswith('Content-Type:'):
            content_type = line.split(': ')[1].strip()
        elif line.startswith('File-Name:'):
            file_name = line.split(': ')[1].strip()

    origin = get_origin_from_headers(headers.decode('UTF-8'))

    while len(body) < content_length:
        body += conn.recv(1048576)

    path = upload_file_to_cloud(user_id, file_name, file=body, content_type=content_type)
    media_file = media(content_type, file_name, user_id, path)
    media_id = access_media_persistence().add_media(media_file)
    file_uploaded = is_file_in_bucket(path)

    if media_id is not None and file_uploaded:
        access_user_persistence().update_user_profile_pic(user_id=user_id, profile_pic_id=media_id)
        print(f"*************** File uploaded, media_id: {media_id}, path: {path}")
        send_response(conn, 200, "OK", body=json.dumps({"media_id": media_id}).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 500, "Could not upload profile picture, internal Server Error", body=b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))


def delete_user(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)

    content_length = 0

    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')

    data = json.loads(body)
    user_id = data.get("userId")
    origin = get_origin_from_headers(headers)

    if access_user_persistence().get_user_by_id(user_id) is not None:
        access_session_persistence().remove_session_by_user_id(user_id)
        access_user_persistence().remove_user_by_id(user_id)
        send_response(conn, 200, "OK", body=b"<h1>200 OK</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 404, "Could not find the user you are trying to delete", body=b"<h1>404 Not Found</h1>", headers=get_cors_headers(origin))

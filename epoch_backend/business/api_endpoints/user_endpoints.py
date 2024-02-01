import datetime
import json
from epoch_backend.business.utils import send_response, get_cors_headers, get_origin_from_headers, upload_file_to_cloud, download_file_to_cloud, is_file_in_bucket
from epoch_backend.business.db_controller.access_user_persistence import access_user_persistence
from epoch_backend.business.db_controller.access_media_persistence import access_media_persistence
from epoch_backend.business.db_controller.access_session_persistence import access_session_persistence
from epoch_backend.objects.session import session
from epoch_backend.objects.media import media
from epoch_backend.objects.user import user
import uuid
import base64

def post_user(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)  # Split request data into headers and body
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
        send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>", headers=get_cors_headers(origin))

def get_user(conn, request_data, session_id):
    headers, body = request_data.split("\r\n\r\n", 1)
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
                send_response(conn, 200, "OK", body=json.dumps(user_fetch.__dict__).encode('UTF-8'), headers=headers)
        else:
            send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>", headers=headers)
    else:
        send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>", headers=headers)

def register_user(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
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
            send_response(conn, 500, "Internal Server Error", body=b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 409, "Conflict", body=b"<h1>409 Conflict</h1>", headers=get_cors_headers(origin))

def upload_file(conn, request_data):
    headers, body = request_data.split(b'\r\n\r\n', 1)
    content_length = int(headers.split(b'\r\n')[3].split(b': ')[1])
    user_id = headers.split(b'\r\n')[4].split(b': ')[1].decode('UTF-8')
    content_type = headers.split(b'\r\n')[9].split(b': ')[1].decode('UTF-8')
    file_name = headers.split(b'\r\n')[10].split(b': ')[1].decode('UTF-8')
    origin = get_origin_from_headers(headers.decode('UTF-8'))

    print(f"Heard:\n{headers.decode('UTF-8')}\n")

    while len(body) < content_length:
        body += conn.recv(1048576)

    path = upload_file_to_cloud(user_id, file_name, file=body, content_type=content_type)
    media_file = media(content_type, file_name, user_id, path)
    media_id = access_media_persistence().add_media(media_file)

    if media_id is not None:
        access_user_persistence().update_user_profile_pic(user_id=user_id, profile_pic_id=media_id)
        send_response(conn, 200, "OK", body=b"<h1>200 OK</h1>", headers=get_cors_headers(origin))
    else:
        send_response(conn, 500, "Internal Server Error", body=b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))



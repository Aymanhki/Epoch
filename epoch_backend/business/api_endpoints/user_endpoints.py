import datetime
import json
from epoch_backend.business.utils import send_response, get_cors_headers, get_origin_from_headers
from epoch_backend.business.db_controller.access_user_persistence import access_user_persistence
from epoch_backend.business.db_controller.access_session_persistence import access_session_persistence
from epoch_backend.objects.session import session
import uuid

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

        if user_fetch is not None:
            user = user_fetch

            if user is not None:
                send_response(conn, 200, "OK", body=json.dumps(user.__dict__).encode('UTF-8'), headers=headers)
            else:
                send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>", headers=headers)
        else:
            send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>", headers=headers)
    else:
        send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>", headers=headers)

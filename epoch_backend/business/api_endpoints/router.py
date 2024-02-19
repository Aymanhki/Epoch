import json
import os
from ..utils import get_cors_headers, get_origin_from_headers, send_response, get_last_modified, guess_file_type, get_session_id_from_request, send_cors_options_response
from ..api_endpoints.following_endpoints import get_account_list, get_following_list, follow_user, unfollow_user
from ..api_endpoints.user_endpoints import post_user, get_user, register_user, delete_by_user_id, delete_by_username
from ..db_controller.access_session_persistence import access_session_persistence
from ..db_controller.access_user_persistence import access_user_persistence
#from business.api_endpoints.following_endpoints import get_account_list


HOME_PATH = os.path.normpath('.././epoch_frontend/build/')
INDEX_HTML_PATH = os.path.normpath('/index.html')

def handle_routing(relative_path, request_data, conn, method):
    if relative_path.startswith('/api/'):
        if relative_path.startswith('/api/') and relative_path != '/api/login/' and relative_path != '/api/register/' and relative_path != '/api/upload/profile/1/':
            session_id = get_session_id_from_request(request_data)
            if access_session_persistence().get_session(session_id) is None:
                print("\n* Unauthorized request rejected *\n")
                send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>")
                return

        handle_api_request(method, relative_path, request_data, conn)

    else:
        if relative_path == '/':
            relative_path = INDEX_HTML_PATH

        full_path = os.path.join(HOME_PATH, relative_path.lstrip('/'))  # Get the full path of the file requested by the client
        handle_static_request(method, conn, full_path)

def handle_api_request(method, path, request_data, conn):
    origin = get_origin_from_headers(request_data)
    if method == "OPTIONS":  # Handle CORS preflight request
        send_cors_options_response(request_data, conn)
        return

    if path == "/api/login/":
        if method == "POST":  # if the user is logging in
            post_user(conn, request_data)

        elif method == "GET":  # if the client is checking if there is a valid session
            session_id = get_session_id_from_request(request_data)
            get_user(conn, request_data, session_id)

        elif method == "DELETE":
            pass # log out logic

        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path == "/api/register/":
        if method == "POST":
            register_user(conn, request_data)

        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path == "/api/delete/userId/":
        if method == "DELETE":
            delete_by_user_id(conn, request_data)

        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")
    elif path == "/api/delete/username/":
        if method == "DELETE":
            delete_by_username(conn, request_data)

        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path == "/api/follow/accountList/":
        if method == "GET":
            session_id = get_session_id_from_request(request_data)
            response = get_account_list(session_id, access_session_persistence(), access_user_persistence())
            send_response(conn, response[0], response[1], body = response[2], headers=get_cors_headers(origin))
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    
    elif path == "/api/follow/followingList/":
        if method == "GET":
            session_id = get_session_id_from_request(request_data)
            response = get_following_list(session_id, access_session_persistence(), access_user_persistence())
            send_response(conn, response[0], response[1], body = response[2], headers=get_cors_headers(origin))
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")


    elif path == "/api/follow/follow/":
        if method == "POST":
            session_id = get_session_id_from_request(request_data) #get params from request
            headers, body = request_data.split("\r\n\r\n", 1)
            content_length = 0
            for line in headers.split("\r\n"):
                if "Content-Length" in line:
                    content_length = int(line.split(" ")[1])
            while len(body) < content_length:
                body += conn.recv(1024).decode('UTF-8')
            data = json.loads(body)
            toFollow = data["userToFollow"]

            response = follow_user(session_id, toFollow, access_session_persistence(), access_user_persistence())
            send_response(conn, response[0], response[1], body = response[2], headers=get_cors_headers(origin))
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path == "/api/follow/unfollow/":
        if method == "POST":
            session_id = get_session_id_from_request(request_data) #get params from request
            headers, body = request_data.split("\r\n\r\n", 1) 
            content_length = 0
            for line in headers.split("\r\n"):
                if "Content-Length" in line:
                    content_length = int(line.split(" ")[1])
            while len(body) < content_length:
                body += conn.recv(1024).decode('UTF-8')
            data = json.loads(body)
            toUnfollow = data["userToUnfollow"]

            response = unfollow_user(session_id, toUnfollow, access_session_persistence(), access_user_persistence())
            send_response(conn, response[0], response[1], body = response[2], headers=get_cors_headers(origin))
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")
    
    else:
        send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>")

    return

def handle_static_request(method, conn, path):
    absolute_path = os.path.abspath(path)

    if not os.path.exists(absolute_path) and path != INDEX_HTML_PATH:
        send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>")
        return

    file_extension = os.path.splitext(absolute_path)[1]  # Get the file extension from the full path
    content_type, _ = guess_file_type(file_extension)  # Get the content type from the file extension
    last_modified = get_last_modified(absolute_path)  # Get the last modified date from the full path

    headers = {
        "Content-Type": content_type,
        "Last-Modified": last_modified,
        "Server": "Ayman's business"
    }  # To send back to the client

    if method == "HEAD":  # If the method is HEAD, send a response without the body
        send_response(conn, 200, "OK", headers=headers)
        return

    index_path = os.path.abspath(os.path.join(HOME_PATH, INDEX_HTML_PATH.lstrip('/')))

    with open(index_path, 'rb') as file:
        body = file.read()
        send_response(conn, 200, "OK", body=body, headers=headers)
        return

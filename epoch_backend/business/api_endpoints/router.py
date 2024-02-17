import os
from ..utils import send_response, get_last_modified, guess_file_type, get_session_id_from_request, send_cors_options_response
from ..api_endpoints.user_endpoints import post_user, get_user, register_user, delete_user, get_user_from_name
from ..db_controller.access_session_persistence import access_session_persistence

HOME_PATH = os.path.normpath('.././epoch_frontend/build/')
INDEX_HTML_PATH = os.path.normpath('/index.html')

def handle_routing(relative_path, request_data, conn, method):
    if relative_path.startswith('/api/'):
        if relative_path.startswith('/api/') and relative_path != '/api/login/' and relative_path != '/api/register/' and relative_path != '/api/upload/profile/1/'and relative_path != '/api/user/':
            session_id = get_session_id_from_request(request_data)
            if access_session_persistence().get_session(session_id) is None:
                send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>")
                return

        handle_api_request(method, relative_path, request_data, conn)

    else:
        if relative_path == '/':
            relative_path = INDEX_HTML_PATH

        full_path = os.path.join(HOME_PATH, relative_path.lstrip('/'))  # Get the full path of the file requested by the client
        handle_static_request(method, conn, full_path)

def handle_api_request(method, path, request_data, conn):
    if method == "OPTIONS":  # Handle CORS preflight request
        send_cors_options_response(request_data, conn)
        print("handled options")
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

    elif path == "/api/delete/user/":
        if method == "DELETE":
            delete_user(conn, request_data)

        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")
    elif path == "/api/user":
        if method == "GET":
            username = get_user_from_name(conn, request_data, username)
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
    # Otherwise it is a GET request, so serve the file
    with open(index_path, 'rb') as file:
        body = file.read()
        send_response(conn, 200, "OK", body=body, headers=headers)
        return

import os
from epoch_backend.business.utils import send_response, get_last_modified, guess_file_type, is_session_valid

HOME_PATH = os.path.normpath('.././epoch_frontend/build/')
INDEX_HTML_PATH = os.path.normpath('/index.html')

def handle_routing(relative_path, request_data, conn, method, sessions):
    if relative_path.startswith('/api/'):
        if relative_path.startswith('/api/') and relative_path != '/api/login':
            if not is_session_valid(request_data, sessions):
                send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>")
                return

        handle_api_request(method, relative_path, request_data, conn, sessions)

    else:
        if relative_path == '/':
            relative_path = INDEX_HTML_PATH

        full_path = os.path.join(HOME_PATH, relative_path.lstrip('/'))  # Get the full path of the file requested by the client
        handle_static_request(method, conn, full_path)

def handle_api_request(method, path, request_data, conn, sessions):
    if path == "/api/login":
        if method == "POST":  # if the user is logging in
            pass # login logic

        elif method == "GET":  # if the client is checking if there is a valid session
            if is_session_valid(request_data, sessions):
                send_response(conn, 200, "OK", body=b"")

            else:
                send_response(conn, 401, "Unauthorized", body=b"<h1>401 Unauthorized</h1>")

        elif method == "DELETE":
            pass # log out logic

    elif path == "":
        pass # handle other api requests

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

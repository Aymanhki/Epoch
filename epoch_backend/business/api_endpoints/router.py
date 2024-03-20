import json
import os

from ..api_endpoints.following_endpoints import follow_user, get_account_list, get_follower_list, get_following_list, unfollow_user
from ..utils import get_cors_headers, get_origin_from_headers, send_response, get_last_modified, guess_file_type, get_session_id_from_request, send_cors_options_response
from ..api_endpoints.user_endpoints import delete_by_user_id, delete_by_username, post_user, get_user, register_user, get_user_from_name, upload_profile_pic, update_user_info
from ..db_controller.access_user_persistence import access_user_persistence
from ..db_controller.access_session_persistence import access_session_persistence
from ..api_endpoints.post_endpoints import new_post, get_all_user_posts, get_all_hashtag_posts, delete_post, update_post, get_followed_users_posts, favorite_post, remove_favorite_post, get_favorites, vote_post, remove_vote_post
from ..api_endpoints.comment_endpoints import new_comment, get_all_comments_post, delete_comment
from ..api_endpoints.post_endpoints import new_post, get_all_user_posts, get_all_hashtag_posts, delete_post, update_post, get_followed_users_posts, favorite_post, remove_favorite_post, get_favorites

HOME_PATH = os.path.normpath('.././epoch_frontend/build/')
INDEX_HTML_PATH = os.path.normpath('/index.html')

no_auth_endpoints = [
    "/api/login/",
    "/api/register/",
    "/api/user/",
    "/api/user/",
    "/api/follow/accountList/",
    "/api/follow/followingList/",
    "/api/follow/followerList/",
    "/api/follow/follow/",
    "/api/follow/unFollow/",
    "/api/upload/profile/1/",
    "/api/user/posts/",
    "/api/post/hashtag/",
    "/api/delete/userId/",
]


def handle_routing(relative_path, request_data, conn, method):
    if relative_path.startswith('/api/'):
        if relative_path not in no_auth_endpoints and method != "OPTIONS":
            session_id = get_session_id_from_request(request_data)

            if access_session_persistence().get_session(session_id) is None:
                send_response(conn, 401, "Unauthorized (Missing Session Cookie)", body=b"<h1>401 Unauthorized</h1>")
                return

        handle_api_request(method, relative_path, request_data, conn)
    
    else:
        send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>")
    ''' # Not Used
        if relative_path == '/':
            relative_path = INDEX_HTML_PATH

        full_path = os.path.join(HOME_PATH, relative_path.lstrip('/'))
        handle_static_request(method, conn, full_path)
    '''


def handle_api_request(method, path, request_data, conn):
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
            pass  # log out logic

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
    elif path == "/api/user/":
        if method == "GET":
            get_user_from_name(conn, request_data)
        elif method == "POST":
            update_user_info(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path.startswith("/api/follow/"):
        # split request data into headers, body
        headers, body = request_data.split("\r\n\r\n", 1)
        content_length = 0
        for line in headers.split("\r\n"):
            if "Content-Length" in line:
                content_length = int(line.split(" ")[1])


        while len(body) < content_length:
            body += conn.recv(1024).decode('UTF-8')

        # get data from body and headers
        if content_length > 0:
            data = json.loads(body)

        origin = get_origin_from_headers(headers)
        session_id = get_session_id_from_request(request_data)
        # init response 
        response = [405, "Method Not Allowed", b"<h1>405 Method Not Allowed</h1>"]
        # handle specific request
        if path == "/api/follow/accountList/" and method == 'GET':
            response = get_account_list(session_id, access_session_persistence(), access_user_persistence())

        elif path == "/api/follow/followingList/" and method == 'GET':
            response = get_following_list(session_id, access_session_persistence(), access_user_persistence(), "self")

        elif path == "/api/follow/followingList/" and method == 'POST':
            if content_length > 0:
                target = data["target"]
            response = get_following_list(session_id, access_session_persistence(), access_user_persistence(), target)

        elif path == "/api/follow/followerList/" and method == 'POST':
            if content_length > 0:
                target = data["target"]
            response = get_follower_list(session_id, access_session_persistence(), access_user_persistence(), target)

        elif path == "/api/follow/follow/" and method == 'POST':
            if content_length > 0:
                toFollow = data["userToFollow"]
                response = follow_user(session_id, toFollow, access_session_persistence(), access_user_persistence())
            else:
                response = [500, "Server error: no request body", b"<h1>500 Internal Server Error</h1>"]

        elif path == "/api/follow/unfollow/" and method == 'POST':
            if content_length > 0:
                toUnfollow = data["userToUnfollow"]
                response = unfollow_user(session_id, toUnfollow, access_session_persistence(),
                                         access_user_persistence())
            else:
                response = [500, "Server error: no request body", b"<h1>500 Internal Server Error</h1>"]

        send_response(conn, response[0], response[1], response[2], headers=get_cors_headers(origin))

    elif path.startswith("/api/post/"):
        if method == "POST":
            new_post(conn, request_data)
        elif method == "GET" and path.startswith("/api/post/hashtag/"):
            get_all_hashtag_posts(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path.startswith("/api/user/posts/"):
        if method == "GET":
            get_all_user_posts(conn, request_data)
        elif method == "DELETE":
            delete_post(conn, request_data)
        elif method == "PUT":
            update_post(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path.startswith("/api/followed/posts/"):
        if method == "GET":
            get_followed_users_posts(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")

    elif path.startswith("/api/favorite/posts/"):
        if method == "POST":
            favorite_post(conn, request_data)
        elif method == "DELETE":
            remove_favorite_post(conn, request_data)
        elif method == "GET":
            get_favorites(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed>")

    elif path.startswith("/api/upload/profile/1/"):
        if method == "POST":
            upload_profile_pic(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed</h1>")
    # Comment paths
    elif path.startswith("/api/comments/post/"):
        if method == "POST":
            new_comment(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed>")
    elif path.startswith("/api/comments/delete/"):
        if method == "DELETE":
            delete_comment(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed>")
    elif path.startswith("/api/comments/get/"):
        if method == "GET":
            get_all_comments_post(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed>")
    elif path.startswith("/api/vote/post/"):
        if method == "POST":
            vote_post(conn, request_data)
        elif method == "DELETE":
            remove_vote_post(conn, request_data)
        else:
            send_response(conn, 405, "Method Not Allowed", body=b"<h1>405 Method Not Allowed>")
    else:
        send_response(conn, 404, "Not Found", body=b"<h1>404 Not Found</h1>")

    return

''' # Not Implemented
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
'''
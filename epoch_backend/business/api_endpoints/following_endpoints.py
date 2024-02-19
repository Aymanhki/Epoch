import datetime
import json
from ..utils import send_response, get_cors_headers, get_origin_from_headers, upload_file_to_cloud, download_file_to_cloud, is_file_in_bucket,get_session_id_from_request
from ..db_controller.access_user_persistence import access_user_persistence
from ..db_controller.access_media_persistence import access_media_persistence
from ..db_controller.access_session_persistence import access_session_persistence

def get_account_list(conn, request_data, session_id):
    try:
        user_id_l = access_session_persistence().get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0] #convert what is returned to an int
    except:
        return ([500, "No valid session", b"<h1>500 Internal Server Error</h1>"])
    try:
        accountList = access_user_persistence().get_all_users(user_id)
        return([200, "OK", accountList.encode('UTF-8')])
    except:
        return ([500, "Could not retrieve user list", b"<h1>500 Internal Server Error</h1>"])


def get_following_list(conn, request_data, session_id):
    try:
        user_id_l = access_session_persistence().get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0] #convert what is returned to an int
    except:
        return ([500, "No valid session", b"<h1>500 Internal Server Error</h1>"])
    try:
        followingList = access_user_persistence().get_following(user_id)
        return([200, "OK", followingList.encode('UTF-8')])
    except:
        return ([500, "Could not retrieve following list", b"<h1>500 Internal Server Error</h1>"])


def follow_user(conn, request_data, session_id):
    headers, body = request_data.split("\r\n\r\n", 1)
    content_length = 0
    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')
    data = json.loads(body)
    toFollow = data["userToFollow"]
    try:
        user_id_l = access_session_persistence().get_user_by_session_id(data["session_id"])
        user_id = [int(l[0]) for l in user_id_l][0]
    except:
        return ([500, "Could not follow user: no valid session", b"<h1>500 Internal Server Error</h1>"])

    if user_id is not None and toFollow is not None:
        try:
            access_user_persistence().follow_user(user_id=user_id, following_id=toFollow)
            return([200, "OK", json.dumps({"user_id": user_id}).encode('UTF-8')])
        except:
            return ([500, "Could not follow user: error following", b"<h1>500 Internal Server Error</h1>"])
    else:
        return ([500, "Could not follow user: invalid id", b"<h1>500 Internal Server Error</h1>"])


def unfollow_user(conn, request_data, session_id):
    headers, body = request_data.split("\r\n\r\n", 1)
    content_length = 0
    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')
    data = json.loads(body)
    toUnfollow = data["userToUnfollow"]
    try:
        user_id_l = access_session_persistence().get_user_by_session_id(data["session_id"])
        user_id = [int(l[0]) for l in user_id_l][0]
    except:
        return ([500, "Could not follow user: no valid session", b"<h1>500 Internal Server Error</h1>"])

    if user_id is not None and toUnfollow is not None:
        try:
            access_user_persistence().unfollow_user(user_id=user_id, following_id=toUnfollow)
            return([200, "OK", json.dumps({"user_id": user_id}).encode('UTF-8')])
        except:
            return ([500, "Could not unfollow user: error unfollowing", b"<h1>500 Internal Server Error</h1>"])
    else:
        return ([500, "Could not unfollow user: invalid id", b"<h1>500 Internal Server Error</h1>"])
import datetime
import json
from ..utils import send_response, get_cors_headers, get_origin_from_headers, upload_file_to_cloud, download_file_to_cloud, is_file_in_bucket,get_session_id_from_request
from ..db_controller.access_user_persistence import access_user_persistence
from ..db_controller.access_media_persistence import access_media_persistence
from ..db_controller.access_session_persistence import access_session_persistence

#this all needs error handling @cedric

def get_account_list(conn, request_data, session_id):
    origin = get_origin_from_headers(request_data)
    user_id_l = access_session_persistence().get_user_by_session_id(session_id)
    user_id = [int(l[0]) for l in user_id_l][0]

    accountList = access_user_persistence().get_all_users(user_id)

    send_response(conn, 200, "OK", body=accountList.encode('UTF-8'), headers=get_cors_headers(origin))

def get_following_list(conn, request_data, session_id):
    origin = get_origin_from_headers(request_data)
    user_id_l = access_session_persistence().get_user_by_session_id(session_id)
    user_id = [int(l[0]) for l in user_id_l][0]

    followingList = access_user_persistence().get_following(user_id)

    send_response(conn, 200, "OK", body=followingList.encode('UTF-8'), headers=get_cors_headers(origin))

def follow_user(conn, request_data, session_id):
    headers, body = request_data.split("\r\n\r\n", 1)
    content_length = 0
    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')
    data = json.loads(body)
    origin = get_origin_from_headers(headers)
    user_id_l = access_session_persistence().get_user_by_session_id(data["session_id"])
    user_id = [int(l[0]) for l in user_id_l][0]
    toFollow = data["userToFollow"]

    if user_id is not None and toFollow is not None:
        access_user_persistence().follow_user(user_id=user_id, following_id=toFollow)
        print("\nuser: ", user_id, " followed ", toFollow,"\n")
        send_response(conn, 200, "OK", body=json.dumps({"user_id": user_id}).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 500, "Could not follow user", body=b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))

def unfollow_user(conn, request_data, session_id):
    headers, body = request_data.split("\r\n\r\n", 1)
    content_length = 0
    for line in headers.split("\r\n"):
        if "Content-Length" in line:
            content_length = int(line.split(" ")[1])

    while len(body) < content_length:
        body += conn.recv(1024).decode('UTF-8')
    data = json.loads(body)
    origin = get_origin_from_headers(headers)
    user_id_l = access_session_persistence().get_user_by_session_id(data["session_id"])
    user_id = [int(l[0]) for l in user_id_l][0]
    toUnfollow = data["userToUnfollow"]

    if user_id is not None and toUnfollow is not None:
        access_user_persistence().unfollow_user(user_id=user_id, following_id=toUnfollow)
        print("\nuser: ", user_id, " unfollowed ", toUnfollow,"\n")
        send_response(conn, 200, "OK", body=json.dumps({"user_id": user_id}).encode('UTF-8'), headers=get_cors_headers(origin))
    else:
        send_response(conn, 500, "Could not unfollow user", body=b"<h1>500 Internal Server Error</h1>", headers=get_cors_headers(origin))
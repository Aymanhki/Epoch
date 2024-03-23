import json
from ..utils import send_response, get_cors_headers, get_origin_from_headers
from ..db_controller.access_notification_persistence import access_notification_persistence
from epoch_backend.objects.notification import notification


def get_user_notifications(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    origin = get_origin_from_headers(headers)
    user_id = None
    limit = None
    offset = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])
        if "Limit" in line:
            limit = int(line.split(" ")[1])
        if "Offset" in line:
            offset = int(line.split(" ")[1])

        if user_id and (limit or limit == 0) and (offset or offset == 0):
            break

    if user_id and (limit or limit == 0) and (offset or offset == 0):
        notifs = access_notification_persistence().get_user_notifications(user_id, limit, offset)
        send_response(conn, 200, "OK", json.dumps(notifs).encode(), headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Missing User-Id, Limit, or Offset", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


def mark_notification_read(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    origin = get_origin_from_headers(headers)
    notif_id = None

    for line in headers.split("\r\n"):
        if "Notif-Id" in line:
            notif_id = int(line.split(" ")[1])
            break

    if notif_id:
        access_notification_persistence().mark_notification_read(notif_id)
        send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Missing Notif-Id", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))


def mark_all_notifications_read(conn, request_data):
    headers, body = request_data.split("\r\n\r\n", 1)
    origin = get_origin_from_headers(headers)
    user_id = None

    for line in headers.split("\r\n"):
        if "User-Id" in line:
            user_id = int(line.split(" ")[1])
            break

    if user_id:
        access_notification_persistence().mark_all_notifications_read(user_id)
        send_response(conn, 200, "OK", b"", headers=get_cors_headers(origin))
    else:
        send_response(conn, 400, "Missing User-Id", b"<h1>400 Bad Request</h1>", headers=get_cors_headers(origin))

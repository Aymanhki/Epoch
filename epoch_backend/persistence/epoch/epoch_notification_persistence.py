from ..interfaces.notification_persistence import notification_persistence
from ...objects.notification import notification
from ...business.utils import get_db_connection


class epoch_notification_persistence(notification_persistence):
    def __init__(selfs):
        pass

    def get_user_notifications(self, user_id: int, limit: int, offset: int):
        conn = get_db_connection()
        curr = conn.cursor()

        curr.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT %s OFFSET %s", (user_id, limit, offset))
        notifs = curr.fetchall()

        for i in range(len(notifs)):
            notifs[i] = notification(notifs[i][0], notifs[i][1], notifs[i][2], notifs[i][3], str(notifs[i][4]), notifs[i][5], notifs[i][6], notifs[i][7]).__dict__
            curr.execute("SELECT profile_pic FROM users WHERE username = %s", (notifs[i]["target_username"],))
            notifs[i]["target_profile_pic"] = curr.fetchone()[0]
            curr.execute("SELECT path FROM media_content WHERE media_id = %s", (notifs[i]["target_profile_pic"],))
            notifs[i]["target_profile_pic"] = curr.fetchone()[0]



        curr.close()
        conn.close()

        return notifs

    def mark_notification_read(self, notif_id: int):
        conn = get_db_connection()
        curr = conn.cursor()

        curr.execute("UPDATE notifications SET read = TRUE WHERE notif_id = %s", (notif_id,))

        conn.commit()
        curr.close()
        conn.close()

    def mark_all_notifications_read(self, user_id: int):
        conn = get_db_connection()
        curr = conn.cursor()

        curr.execute("UPDATE notifications SET read = TRUE WHERE user_id = %s", (user_id,))

        conn.commit()
        curr.close()
        conn.close()

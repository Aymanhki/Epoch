from epoch_backend.persistence.interfaces.notification_persistence import notification_persistence
from epoch_backend.objects.notification import notification
from epoch_backend.business.services import services


class access_notification_persistence(notification_persistence):
    def __init__(self):
        self.notification_persistence = services.get_notification_persistence()

    def mark_notification_read(self, notif_id: int):
        return self.notification_persistence.mark_notification_read(notif_id)

    def mark_all_notifications_read(self, user_id: int):
        return self.notification_persistence.mark_all_notifications_read(user_id)

    def get_user_notifications(self, user_id: int, limit: int, offset: int):
        return self.notification_persistence.get_user_notifications(user_id, limit, offset)


from abc import ABC, abstractmethod
from ...objects.notification import notification

class notification_persistence(ABC):
    @abstractmethod
    def get_user_notifications(self, user_id: int, limit: int, offset: int):
        pass

    @abstractmethod
    def mark_notification_read(self, notif_id: int):
        pass

    @abstractmethod
    def mark_all_notifications_read(self, user_id: int):
        pass
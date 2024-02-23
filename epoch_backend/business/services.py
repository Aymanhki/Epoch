from ..persistence.epoch.epoch_user_persistence import epoch_user_persistence
from ..persistence.epoch.epoch_session_persistence import epoch_session_persistence
from ..persistence.epoch.epoch_media_persistence import epoch_media_persistence
from .. persistence.epoch.epoch_post_persistence import epoch_post_persistence

class services:
    @staticmethod
    def get_user_persistence():
        return epoch_user_persistence()

    @staticmethod
    def get_session_persistence():
        return epoch_session_persistence()

    @staticmethod
    def get_media_persistence():
        return epoch_media_persistence()
    @staticmethod
    def get_post_persistence():
        return epoch_post_persistence()

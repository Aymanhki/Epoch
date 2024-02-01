from epoch_backend.persistence.interfaces.user_persistence import user_persistence
from epoch_backend.objects.user import user
from epoch_backend.business.services import services
class access_user_persistence(user_persistence):
    def __init__(self):
        self.user_persistence = services.get_user_persistence()

    def get_user(self, username: str):
        return self.user_persistence.get_user(username)

    def get_user_by_id(self, user_id: int):
        return self.user_persistence.get_user_by_id(user_id)

    def add_user(self, new_user: user):
        return self.user_persistence.add_user(new_user)

    def remove_user(self, username: str):
        pass

    def update_user(self, user_to_update: user):
        pass

    def get_all_users(self):
        pass

    def validate_login(self, username: str, password: str):
        return self.user_persistence.validate_login(username, password)

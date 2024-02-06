from persistence.interfaces.user_persistence import user_persistence
from objects.user import user
from business.services import services

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
        self.user_persistence.remove_user(username)

    def update_user(self, user_to_update: user):
        pass

    def get_all_users(self):
        pass

    def validate_login(self, username: str, password: str):
        return self.user_persistence.validate_login(username, password)

    def update_user_profile_pic(self, user_id: int, profile_pic_id: int):
        self.user_persistence.update_user_profile_pic(user_id, profile_pic_id)

    def remove_user_by_id(self, user_id: int):
        self.user_persistence.remove_user_by_id(user_id)

    def get_followers(self, user_id: int):
        return self.user_persistence.get_followers(user_id)

    def get_following(self, user_id: int):
        return self.user_persistence.get_following(user_id)

    def follow_user(self, user_id: int, following_id: int):
        self.user_persistence.follow_user(user_id, following_id)

    def unfollow_user(self, user_id: int, following_id: int):
        self.user_persistence.unfollow_user(user_id, following_id)
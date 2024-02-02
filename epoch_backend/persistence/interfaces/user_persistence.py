from abc import ABC, abstractmethod
from objects.user import user

class user_persistence(ABC):
    @abstractmethod
    def get_user(self, username: str):
        pass

    @abstractmethod
    def get_user_by_id(self, user_id: int):
        pass

    @abstractmethod
    def add_user(self, new_user: user):
        pass

    @abstractmethod
    def remove_user(self, username: str):
        pass

    @abstractmethod
    def update_user(self, user_to_update: user):
        pass

    @abstractmethod
    def get_all_users(self):
        pass

    @abstractmethod
    def validate_login(self, username: str, password: str):
        pass

    @abstractmethod
    def update_user_profile_pic(self, user_id: int, profile_pic_id: int):
        pass

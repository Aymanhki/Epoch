from abc import ABC, abstractmethod
from epoch_backend.objects.user import user

class user_persistence(ABC):
    @abstractmethod
    def get_user(self, username: str):
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

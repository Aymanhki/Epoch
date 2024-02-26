from abc import ABC, abstractmethod
from ...objects.post import post

class post_persistence(ABC):
    @abstractmethod
    def add_post(self, new_post: post):
        pass

    @abstractmethod
    def remove_post(self, post_id: int):
        pass

    @abstractmethod
    def get_post(self, post_id: int):
        pass

    @abstractmethod
    def update_post(self, post_id: int, new_post: post):
        pass

    @abstractmethod
    def get_all_user_posts(self, user_id: int):
        pass

    def get_all_hashtag_posts(self, hashtag: str):
        pass

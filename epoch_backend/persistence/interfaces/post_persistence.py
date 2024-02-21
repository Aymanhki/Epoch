from abc import ABC, abstractmethod
from ...objects.post import post

class post_persistence(ABC):
    @abstractmethod
    def create_post(self, post_id: int, user_id: int, body: str, release_at: str):
        pass

    @abstractmethod
    def get_post_by_post_id(self, post_id: int):
        pass

    @abstractmethod
    def get_posts_by_user_id(self, user_id: int):
        pass

    @abstractmethod
    def update_post_media(self, post_id: int, media: int):
        pass

    @abstractmethod
    def update_post_body(self, post_id: int, body: str):
        pass

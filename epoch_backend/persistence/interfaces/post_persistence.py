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
    def get_all_user_posts(self, user_id: int, offset: int, limit: int):
        pass
    
    @abstractmethod
    def get_all_hashtag_posts(self, hashtag: str, offset: int, limit: int):
        pass
    
    @abstractmethod
    def get_followed_users_posts(self, user_id: int, offset: int, limit: int):
        pass

    @abstractmethod
    def favorite_post(self, post_id: int, user_id: int):
        pass

    @abstractmethod
    def remove_favorite_post(self, post_id: int, user_id: int):
        pass

    @abstractmethod
    def get_favorites(self, user_id: int, offset: int, limit: int):
        pass
    
    @abstractmethod
    def vote_post(self, post_id: int, user_id: int, vote: int):
        pass

    @abstractmethod
    def remove_vote_post(self, post_id: int, user_id: int, vote: int):
        pass


from epoch_backend.persistence.interfaces.post_persistence import post_persistence
from epoch_backend.objects.post import post
from epoch_backend.business.services import services


class access_post_persistence(post_persistence):
    def __init__(self):
        self.post_persistence = services.get_post_persistence()

    def add_post(self, new_post: post):
        return self.post_persistence.add_post(new_post)

    def remove_post(self, post_id: int):
        self.post_persistence.remove_post(post_id)

    def get_post(self, post_id: int):
        return self.post_persistence.get_post(post_id)

    def get_all_user_posts(self, user_id: int, offset: int, limit: int):
        return self.post_persistence.get_all_user_posts(user_id, offset, limit)

    def get_all_hashtag_posts(self, hashtag: str, offset: int, limit: int):
        return self.post_persistence.get_all_hashtag_posts(hashtag, offset, limit)

    def update_post(self, post_id: int, new_post: post):
        return self.post_persistence.update_post(post_id, new_post)

    def get_followed_users_posts(self, user_id: int, offset: int, limit: int):
        return self.post_persistence.get_followed_users_posts(user_id, offset, limit)

    def favorite_post(self, post_id: int, user_id: int):
        return self.post_persistence.favorite_post(post_id, user_id)

    def remove_favorite_post(self, post_id: int, user_id: int):
        return self.post_persistence.remove_favorite_post(post_id, user_id)

    def get_favorites(self, user_id: int, offset: int, limit: int):
        return self.post_persistence.get_favorites(user_id, offset, limit)

    def vote_post(self, post_id: int, user_id: int, vote: int):
        return self.post_persistence.vote_post(post_id, user_id, vote)
    
    def remove_vote_post(self, post_id: int, user_id: int, vote: int):
        return self.post_persistence.remove_vote_post(post_id, user_id, vote)
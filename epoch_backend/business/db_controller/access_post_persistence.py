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

    def get_all_user_posts(self, user_id: int):
        return self.post_persistence.get_all_user_posts(user_id)
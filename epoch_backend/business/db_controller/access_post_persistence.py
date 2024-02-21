from epoch_backend.persistence.interfaces.post_persistence import post_persistence
from epoch_backend.objects.post import post
from epoch_backend.business.services import services

class access_post_persistence(post_persistence):
    def __init__(self):
        self.post_persistence = services.get_post_persistence()

    def create_post(self, post_id: int, user_id: int, body: str, release_at: str):
        return self.create_post(post_id, user_id, body, release_at)

    def get_post_by_post_id(self, post_id: int):
        return self.get_post_by_post_id(post_id)

    def get_posts_by_user_id(self, user_id: int):
        return self.get_posts_by_user_id(user_id)

    def update_post_media(self, post_id: int, media: int):
        return self.update_post_media(post_id, media)

    def update_post_body(self, post_id: int, body: str):
        return self.update_post_body(post_id, body)
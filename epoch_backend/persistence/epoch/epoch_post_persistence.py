import json
from ..interfaces.post_persistence import post_persistence
from epoch_backend.objects.post import post
from ...business.utils import get_db_connection, delete_file_from_bucket, is_file_in_bucket

class epoch_post_persistence(post_persistence):
    def __init__(self):
        pass

    def create_post(self, post_id: int, user_id: int, body: str, release_at: str):
        pass

    def get_post_by_post_id(self, post_id: int):
        pass

    def get_posts_by_user_id(self, user_id: int):
        pass

    def update_post_media(self, post_id: int, media: int):
        pass

    def update_post_body(self, post_id: int, body: str):
        pass
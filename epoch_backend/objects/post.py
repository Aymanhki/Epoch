from datetime import datetime

class post:
    def __init__ (self, post_id: int, user_id: int, media_id: int, body: str, created_at, release_at):
        self.post_id = post_id
        self.user_id = user_id
        self.media_id = media_id
        self.body = body
        self.created_at = created_at
        self.release_at = release_at

    def is_released(self):
        current_time = datetime.datetime.now()
        difference = current_time - self.release_at
        return difference >= 0
    
    def get_username(self, user_persistence):
        return user_persistence.get_username(self.user_id)

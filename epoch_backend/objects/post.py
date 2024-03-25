class post:
    def __init__(self, user_id, media_id, caption, release, created_at, time_zone):
        self.user_id = user_id
        self.media_id = media_id
        self.caption = caption
        self.release = release
        self.created_at = created_at
        self.time_zone = time_zone

    def __eq__(self, other):
        return self.user_id == other.user_id and self.media_id == other.media_id and self.caption == other.caption and self.release == other.release

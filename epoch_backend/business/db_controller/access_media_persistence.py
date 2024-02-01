from epoch_backend.persistence.interfaces.media_persistence import media_persistence
from epoch_backend.objects.media import media
from epoch_backend.business.services import services

class access_media_persistence(media_persistence):
    def __init__(self):
        self.media_persistence = services.get_media_persistence()

    def add_media(self, new_media: media):
        return self.media_persistence.add_media(new_media)

    def remove_media(self, media_id: int):
        self.media_persistence.remove_media(media_id)

    def get_media(self, media_id: int):
        return self.media_persistence.get_media(media_id)
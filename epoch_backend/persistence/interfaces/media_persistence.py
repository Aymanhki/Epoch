from abc import ABC, abstractmethod
from objects.media import media

class media_persistence(ABC):
    @abstractmethod
    def add_media(self, new_media: media):
        pass

    @abstractmethod
    def remove_media(self, media_id: int):
        pass

    @abstractmethod
    def get_media(self, media_id: int):
        pass

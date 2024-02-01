from epoch_backend.persistence.interfaces.media_persistence import media_persistence
from epoch_backend.objects.media import media
from epoch_backend.business.utils import get_db_connection

class epoch_media_persistence(media_persistence):
    def __init__(self):
        pass

    def add_media(self, new_media: media):
        connection = get_db_connection()
        cursor = connection.cursor()
        query = "INSERT INTO media_content (content_type, content_data, file_name) VALUES (%s, %s, %s)"
        cursor.execute(query, (new_media.content_type, new_media.content_data, new_media.file_name))
        query = "SELECT media_id FROM media_content WHERE content_type = %s AND file_name = %s AND content_data = %s"
        cursor.execute(query, (new_media.content_type, new_media.file_name, new_media.content_data))
        result = cursor.fetchone()
        connection.commit()
        cursor.close()
        connection.close()

        media_id = None

        if result is not None:
            media_id = result[0]

        return media_id

    def remove_media(self, media_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"DELETE FROM media_content WHERE media_id = {media_id}")
        connection.commit()
        cursor.close()
        connection.close()

    def get_media(self, media_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM media_content WHERE media_id = {media_id}")
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        new_media = None

        if result is not None:
            new_media = media(result[1], result[2], result[3])

        return new_media




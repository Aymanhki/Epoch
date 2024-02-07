
from ..interfaces.user_persistence import user_persistence
from epoch_backend.objects.user import user
from ...business.utils import get_db_connection, delete_file_from_bucket, is_file_in_bucket

class epoch_user_persistence(user_persistence):
    def __init__(self):
        pass

    def get_user(self, username: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        if len(result) == 0 or len(result) > 1:
            return None
        else:
            return user(result[0][0], result[0][1], result[0][2], result[0][3], result[0][4], result[0][5], str(result[0][6]))

    def get_user_by_id(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT * FROM users WHERE user_id = '{user_id}'")
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        if len(result) == 0 or len(result) > 1:
            return None
        else:
            return user(result[0][0], result[0][1], result[0][2], result[0][3], result[0][4], result[0][5], str(result[0][6]))

    def add_user(self, new_user: user):
        connection = get_db_connection()
        cursor = connection.cursor()

        if new_user.profile_pic_id is None:
            cursor.execute(f"INSERT INTO users (name, username, password, bio) VALUES ('{new_user.name}', '{new_user.username}', '{new_user.password}', '{new_user.bio}')")
        else:
            cursor.execute(f"INSERT INTO users (name, username, password, bio, profile_pic) VALUES ('{new_user.name}', '{new_user.username}', '{new_user.password}', '{new_user.bio}', {new_user.profile_pic_id})")

        cursor.execute(f"SELECT user_id FROM users WHERE username = '{new_user.username}'")
        result = cursor.fetchone()
        connection.commit()
        cursor.close()
        connection.close()

        user_id = None

        if result is not None:
            user_id = result[0]

        return user_id

    def remove_user(self, username: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"DELETE FROM users WHERE username = '{username}'")
        connection.commit()
        cursor.close()
        connection.close()

    def update_user(self, user_to_update: user):
        pass

    def get_all_users(self):
        pass

    def validate_login(self, username: str, password: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"select * from users where username = '{username}'")
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        if len(result) == 0 or len(result) > 1:
            return False
        else:
            return result[0][3] == password

    def update_user_profile_pic(self, user_id: int, profile_pic_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"UPDATE users SET profile_pic = {profile_pic_id} WHERE user_id = {user_id}")
        connection.commit()
        cursor.close()
        connection.close()

    def remove_user_by_id(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"DELETE FROM users WHERE user_id = {user_id}")
        connection.commit()
        cursor.execute(f"Select path FROM media_content WHERE associated_user = {user_id}")
        result = cursor.fetchall()

        for row in result:
            delete_file_from_bucket(row[0])

            if is_file_in_bucket(row[0]):
                raise Exception("Failed to delete file from bucket")

        cursor.execute(f"DELETE FROM media_content WHERE associated_user = {user_id}")
        connection.commit()
        cursor.execute(f"Select path FROM media_content WHERE associated_user = {user_id}")
        result = cursor.fetchall()

        if len(result) > 0:
            raise Exception("Failed to delete user")

        cursor.close()
        connection.close()



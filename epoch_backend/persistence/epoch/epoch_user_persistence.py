from epoch_backend.persistence.interfaces.user_persistence import user_persistence
from epoch_backend.objects.user import user
from epoch_backend.business.utils import get_db_connection

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
        pass

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

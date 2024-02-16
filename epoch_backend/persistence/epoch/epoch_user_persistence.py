import json
from ..interfaces.user_persistence import user_persistence
from epoch_backend.objects.user import user
from ...business.utils import get_db_connection#, delete_file_from_bucket, is_file_in_bucket

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

        if len(result) == 0 :#or len(result) > 1:
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
        # im thinking this should update follower/following tables to remove user from there also 

    def update_user(self, user_to_update: user):
        pass

    def get_all_users(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"SELECT username, user_id FROM users WHERE NOT user_id = '{user_id}'")
        result = cursor.fetchall()
        cursor.close()
        connection.close()

        rowHeaders = [name[0] for name in cursor.description]
        json_data = []
        for value in result:
            if(len(value[0]) < 25): # there are session ids in the database :(
                json_data.append(dict(zip(rowHeaders, value)))

        return json.dumps(json_data)

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
        #cursor.execute(f"Select path FROM media_content WHERE associated_user = {user_id}")
        result = cursor.fetchall()

        #for row in result:
        #    delete_file_from_bucket(row[0])

        #    if is_file_in_bucket(row[0]):
        #       raise Exception("Failed to delete file from bucket")

        #cursor.execute(f"DELETE FROM media_content WHERE associated_user = {user_id}")
        #connection.commit()
        #cursor.execute(f"Select path FROM media_content WHERE associated_user = {user_id}")
        result = cursor.fetchall()

        if len(result) > 0:
            raise Exception("Failed to delete user")

        cursor.close()
        connection.close()


    def get_followers(self, user_id:int):
    #get list of users that follow user_id
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT follower_id FROM followers WHERE user_id = %s", (user_id,))
        result = cursor.fetchall()
        connection.commit()
        cursor.close()
        connection.close()
        rowHeaders = [name[0] for name in cursor.description]
        json_data = []
        for value in result:
            json_data.append(dict(zip(rowHeaders, value)))
        return json.dumps(json_data)
    
    def get_following(self, user_id:int):
    #get list of users that user_id follows
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT following_id FROM following WHERE user_id = %s", (user_id,))
        result = cursor.fetchall()
        connection.commit()
        cursor.close()
        connection.close()
        rowHeaders = [name[0] for name in cursor.description]
        rowHeaders.append("username")
        json_data = []
        for value in result:
            value = value + ("loading...",)
            json_data.append(dict(zip(rowHeaders, value)))
        return json.dumps(json_data)
    
    def follow_user(self, user_id:int, following_id:int):
    #update dbs user_id is now following following_id
    #user_id is a follower of following_id
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(f"INSERT INTO followers (user_id, follower_id) VALUES ('{following_id}', '{user_id}')")
        cursor.execute(f"INSERT INTO following (user_id, following_id) VALUES ('{user_id}', '{following_id}')")
        connection.commit()
        cursor.close()
        connection.close()

    def unfollow_user(self, user_id, following_id:int):
    #update dbs user_id is no longer following following_id
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM followers WHERE user_id = %s AND follower_id = %s", (following_id, user_id,))
        cursor.execute("DELETE FROM following WHERE user_id = %s AND following_id = %s", (user_id, following_id,))
        connection.commit()
        cursor.close()
        connection.close()

    def get_username(self, user_id: int):
        #get list of users that user_id follows
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT username FROM users WHERE user_id = %s", (user_id,))
        result = cursor.fetchall()
        connection.commit()
        cursor.close()
        connection.close()
        return result
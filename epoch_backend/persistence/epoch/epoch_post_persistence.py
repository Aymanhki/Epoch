from ..interfaces.post_persistence import post_persistence
from ...objects.post import post
from ...objects.media import media
from ...objects.user import user
from ...business.utils import get_db_connection, download_file_from_cloud
import base64
import json
import datetime

class epoch_post_persistence(post_persistence):
    def __init__(self):
        pass

    def add_post(self, new_post: post):
        connection = get_db_connection()
        cursor = connection.cursor()
        if new_post.media_id is not None:
            cursor.execute("INSERT INTO posts (user_id, media_id, caption, release) VALUES (%s, %s, %s, %s)", (new_post.user_id, new_post.media_id, new_post.caption, new_post.release))
        else:
            cursor.execute("INSERT INTO posts (user_id, caption, release) VALUES (%s, %s, %s)", (new_post.user_id, new_post.caption, new_post.release))

        connection.commit()
        connection.close()

    def get_post(self, post_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE id=%s", (post_id,))
        post = cursor.fetchone()
        connection.close()
        return post

    def remove_post(self, post_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM posts WHERE id=%s", (post_id,))
        connection.commit()
        connection.close()

    def get_all_user_posts(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE user_id=%s", (user_id,))
        posts = cursor.fetchall()
        posts_media = {}

        for i in range(len(posts)):
            if posts[i][2] is not None:
                media_id = posts[i][2]
                cursor.execute("SELECT * FROM media_content WHERE media_id=%s", (media_id,))
                post_media = cursor.fetchone()
                posts_media[i] =post_media

        cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
        user = cursor.fetchone()
        username = user[2]
        profile_picture_id = user[5]
        cursor.execute("SELECT * FROM media_content WHERE media_id=%s", (profile_picture_id,))
        profile_picture = cursor.fetchone()
        connection.close()
        profile_picture_type = profile_picture[1]
        #profile_picture = download_file_from_cloud(profile_picture[5])
        #profile_picture = base64.b64encode(profile_picture).decode('utf-8')
        profile_picture = profile_picture[5]


        all_posts = []
        for i in range(len(posts)):
            current_post = posts[i]
            post_dict = {}
            post_dict["post_id"] = current_post[0]
            post_dict["profile_picture"] = profile_picture
            post_dict["username"] = username
            post_dict["release"] = current_post[5].strftime("%Y-%m-%d %H:%M:%S")
            post_dict["caption"] = current_post[3]
            post_dict["created_at"] = current_post[4].strftime("%Y-%m-%d %H:%M:%S")

            if current_post[2] is not None:
                post_media = posts_media.get(i)
                #post_media = download_file_from_cloud(post_media[5])
                #post_media = base64.b64encode(post_media).decode('utf-8')
                post_media = post_media[5]

                post_dict["file_type"] = posts_media.get(i)[1]
                post_dict["file_name"] = posts_media.get(i)[2]

                if posts_media.get(i)[1].startswith("video/quicktime"):
                    post_dict["file"] = post_media
                else:
                    post_dict["file"] = post_media
            else:
                post_dict["file"] = None
                post_dict["file_name"] = None


            all_posts.append(post_dict)

        return all_posts




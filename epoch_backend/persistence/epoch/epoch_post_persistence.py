from ..interfaces.post_persistence import post_persistence
from ...objects.post import post
from ...objects.media import media
from ...objects.user import user
from ...business.utils import get_db_connection, get_posts_media, get_profile_info, get_post_dict, get_posts_users_info, delete_file_from_bucket
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
            cursor.execute("INSERT INTO posts (user_id, media_id, caption, created_at, release) VALUES (%s, %s, %s, %s, %s)", (new_post.user_id, new_post.media_id, new_post.caption, new_post.created_at, new_post.release))
        else:
            cursor.execute("INSERT INTO posts (user_id, caption, created_at, release) VALUES (%s, %s, %s, %s)", (new_post.user_id, new_post.caption, new_post.created_at, new_post.release))

        connection.commit()
        connection.close()

    def get_post(self, post_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id=%s", (post_id,))
        fetched_post = cursor.fetchone()

        if fetched_post:
            post_media = get_posts_media([fetched_post])
            username, profile_picture_url, profile_picture_type, profile_picture_name = get_profile_info(fetched_post[1])
            post_dict = get_post_dict(fetched_post, post_media, username, profile_picture_url, profile_picture_type, profile_picture_name, 0)

            connection.close()
            return post_dict
        else:
            return None

    def remove_post(self, post_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id=%s", (post_id,))
        post_fetch = cursor.fetchone()

        if post_fetch[2] is not None:
            cursor.execute("SELECT * FROM media_content WHERE media_id=%s", (post_fetch[2],))
            media_fetch = cursor.fetchone()
            delete_file_from_bucket(media_fetch[5])

        cursor.execute("DELETE FROM favorites WHERE post_id=%s", (post_id,))
        connection.commit()
        cursor.execute("DELETE FROM posts WHERE post_id=%s", (post_id,))
        connection.commit()
        cursor.execute("DELETE FROM media_content WHERE media_id=%s", (post_fetch[2],))
        connection.commit()
        connection.close()

    def get_all_user_posts(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE user_id=%s", (user_id,))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        username, profile_picture_url, profile_picture_type, profile_picture_name = get_profile_info(user_id)
        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            post_dict = get_post_dict(current_post, posts_media, username, profile_picture_url, profile_picture_type, profile_picture_name, i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts

    def get_all_hashtag_posts(self, hashtag: str):
        connection = get_db_connection()
        cursor = connection.cursor()
        hashtag_pattern = f"%{hashtag}%"
        cursor.execute("SELECT * FROM posts WHERE caption LIKE %s", (hashtag_pattern,))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        posts_users_info = get_posts_users_info(posts)

        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            user_info = posts_users_info.get(i)
            post_dict = get_post_dict(current_post, posts_media, user_info[0], user_info[1], user_info[2], user_info[3], i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts

    def update_post(self, post_id: int, new_post: post):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id=%s", (post_id,))
        old_post = cursor.fetchone()
        old_post_media_id = old_post[2]

        if new_post.media_id is not None and new_post.media_id != -1:
            if (old_post_media_id is not None and new_post.media_id != old_post_media_id) or old_post_media_id is None:
                cursor.execute("UPDATE posts SET media_id=%s, caption=%s, release=%s WHERE post_id=%s", (new_post.media_id, new_post.caption, new_post.release, post_id))
            else:
                cursor.execute("UPDATE posts SET caption=%s, release=%s WHERE post_id=%s", (new_post.caption, new_post.release, post_id))
        else:
            if old_post_media_id is not None and new_post.media_id != -1:
                cursor.execute("UPDATE posts SET media_id=NULL, caption=%s, release=%s WHERE post_id=%s", (new_post.caption, new_post.release, post_id))
            else:
                cursor.execute("UPDATE posts SET caption=%s, release=%s WHERE post_id=%s", (new_post.caption, new_post.release, post_id))

        connection.commit()
        connection.close()

    def get_followed_users_posts(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE user_id = %s OR user_id IN (SELECT following_id FROM following WHERE user_id = %s)",(user_id, user_id))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        posts_users_info = get_posts_users_info(posts)

        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            user_info = posts_users_info.get(i)
            post_dict = get_post_dict(current_post, posts_media, user_info[0], user_info[1], user_info[2], user_info[3], i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts


    def favorite_post(self, post_id: int, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO favorites (user_id, post_id) VALUES (%s, %s)", (user_id, post_id))
        connection.commit()
        cursor.execute("UPDATE posts SET favorite_count = favorite_count + 1 WHERE post_id = %s", (post_id,))
        connection.commit()
        connection.close()

    def remove_favorite_post(self, post_id: int, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM favorites WHERE user_id=%s AND post_id=%s", (user_id, post_id))
        connection.commit()
        cursor.execute("UPDATE posts SET favorite_count = favorite_count - 1 WHERE post_id = %s", (post_id,))
        connection.commit()
        connection.close()

    def get_favorites(self, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id IN (SELECT post_id FROM favorites WHERE user_id=%s)", (user_id,))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        posts_users_info = get_posts_users_info(posts)

        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            user_info = posts_users_info.get(i)
            post_dict = get_post_dict(current_post, posts_media, user_info[0], user_info[1], user_info[2], user_info[3], i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts
    
    def vote_post(self, post_id: int, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO votes (user_id, post_id) VALUES (%s, %s)", (user_id, post_id))
        connection.commit()
        cursor.execute("UPDATE posts SET votes_count = votes_count + 1 WHERE post_id = %s", (post_id,))
        connection.commit()
        connection.close()

    def remove_vote_post(self, post_id: int, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM votes WHERE user_id=%s AND post_id=%s", (user_id, post_id))
        connection.commit()
        cursor.execute("UPDATE posts SET votes_count = votes_count - 1 WHERE post_id = %s", (post_id,))
        connection.commit()
        connection.close()
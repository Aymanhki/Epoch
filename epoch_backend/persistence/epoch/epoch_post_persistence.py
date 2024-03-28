from ..interfaces.post_persistence import post_persistence
from ...objects.post import post
from ...objects.media import media
from ...objects.user import user
from ...business.utils import get_db_connection, get_posts_media, get_profile_info, get_post_dict, get_posts_users_info, delete_file_from_bucket, is_file_in_bucket
import base64
import json
import datetime
import re


class epoch_post_persistence(post_persistence):
    def __init__(self):
        pass

    def add_post(self, new_post: post):
        connection = get_db_connection()
        cursor = connection.cursor()
        if new_post.media_id is not None:
            cursor.execute(
                "INSERT INTO posts (user_id, media_id, caption, created_at, release, time_zone) VALUES (%s, %s, %s, %s, %s, %s) RETURNING post_id",
                (new_post.user_id, new_post.media_id, new_post.caption, new_post.created_at, new_post.release, new_post.time_zone))
        else:
            cursor.execute(
                "INSERT INTO posts (user_id, caption, created_at, release, time_zone) VALUES (%s, %s, %s, %s, %s) RETURNING post_id",
                (new_post.user_id, new_post.caption, new_post.created_at, new_post.release, new_post.time_zone))

        post_id = cursor.fetchone()[0]

        connection.commit()

        if new_post.caption:
            username_reg = re.compile(r'@([a-zA-Z0-9_]+)')
            words = re.split(username_reg, new_post.caption)
            mentioned = words


            if len(mentioned) > 0:
                cursor.execute("SELECT user_id, username, name FROM users WHERE username IN %s", (tuple(mentioned),))
                mentioned_users = cursor.fetchall()
                cursor.execute("SELECT username, name FROM users WHERE user_id=%s", (new_post.user_id,))
                user_info = cursor.fetchone()

                for mentioned_user in mentioned_users:
                    cursor.execute("SELECT * FROM notifications WHERE user_id=%s AND target_id=%s AND type=%s", (mentioned_user[0], post_id, "mention"))
                    mentioned_notification = cursor.fetchone()

                    if not mentioned_notification:
                        cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (mentioned_user[0], "mention", post_id, user_info[0], user_info[1]))
                        connection.commit()


        connection.close()
        return post_id

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
        cursor.execute("DELETE FROM notifications WHERE target_id=%s AND type=%s", (post_id, "mention"))
        cursor.execute("DELETE FROM favorites WHERE post_id=%s", (post_id,))
        cursor.execute("DELETE FROM comments WHERE post_id=%s", (post_id,))
        cursor.execute("DELETE FROM votes WHERE post_id=%s", (post_id,))
        connection.commit()
        cursor.execute("SELECT * FROM media_content WHERE media_id IN (SELECT media_id FROM posts WHERE post_id=%s)", (post_id,))
        medias = cursor.fetchall()
        connection.commit()
        cursor.execute("DELETE FROM posts WHERE post_id=%s", (post_id,))
        connection.commit()

        # check if the post media is referenced in any other tables
        for current_media in medias:
            try:
                reference_count = 0
                cursor.execute("SELECT COUNT(*) FROM posts WHERE media_id IN (SELECT media_id FROM media_content WHERE path=%s)", (current_media[5],))
                reference_count += cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM users WHERE profile_pic IN (SELECT media_id FROM media_content WHERE path=%s)", (current_media[5],))
                reference_count += cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM users WHERE background_pic IN (SELECT media_id FROM media_content WHERE path=%s)", (current_media[5],))
                reference_count += cursor.fetchone()[0]

                if reference_count == 0:
                    delete_file_from_bucket(current_media[5])

                    if is_file_in_bucket(current_media[5]):
                        raise Exception("Failed to delete file from bucket")

                    cursor.execute("DELETE FROM media_content WHERE path=%s", (current_media[5],))
                    connection.commit()
                    cursor.execute("SELECT * FROM media_content WHERE path=%s", (current_media[5],))
                    media = cursor.fetchone()

                    if media:
                        raise Exception("Failed to delete media from database")

            except Exception as e:
                print(f"Failed to delete media: {e}")

        connection.close()

    def get_all_user_posts(self, user_id: int, offset: int, limit: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE user_id=%s ORDER BY created_at DESC LIMIT %s OFFSET %s", (user_id, limit, offset))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        username, profile_picture_url, profile_picture_type, profile_picture_name = get_profile_info(user_id)
        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            post_dict = get_post_dict(current_post, posts_media, username, profile_picture_url, profile_picture_type,
                                      profile_picture_name, i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts

    def get_all_hashtag_posts(self, hashtag: str, offset: int, limit: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        hashtag_pattern = f"%{hashtag}"
        cursor.execute("SELECT * FROM posts WHERE caption LIKE %s ORDER BY created_at DESC LIMIT %s OFFSET %s", (hashtag_pattern, limit, offset))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        posts_users_info = get_posts_users_info(posts)
        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            user_info = posts_users_info.get(i)
            post_dict = get_post_dict(current_post, posts_media, user_info[0], user_info[1], user_info[2], user_info[3],
                                      i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts

    def update_post(self, post_id: int, new_post: post):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id=%s", (post_id,))
        old_post = cursor.fetchone()
        old_post_media_id = old_post[2]
        old_post_caption = old_post[3]

        if new_post.media_id is not None and new_post.media_id != -1:
            if (old_post_media_id is not None and new_post.media_id != old_post_media_id) or old_post_media_id is None:
                cursor.execute("UPDATE posts SET media_id=%s, caption=%s, release=%s WHERE post_id=%s",
                               (new_post.media_id, new_post.caption, new_post.release, post_id))
            else:
                cursor.execute("UPDATE posts SET caption=%s, release=%s WHERE post_id=%s",
                               (new_post.caption, new_post.release, post_id))
        else:
            if old_post_media_id is not None and new_post.media_id != -1:
                cursor.execute("UPDATE posts SET media_id=NULL, caption=%s, release=%s WHERE post_id=%s",
                               (new_post.caption, new_post.release, post_id))
            else:
                cursor.execute("UPDATE posts SET caption=%s, release=%s WHERE post_id=%s",
                               (new_post.caption, new_post.release, post_id))
        connection.commit()

        # if the old caption had a mention that was removed in the new caption, remove the notification
        # if the new caption has a mention that was not in the old caption, add the notification


        new_mentioned = []

        if new_post.caption:
            new_username_reg = re.compile(r'@([a-zA-Z0-9_]+)')
            new_words = re.split(new_username_reg, new_post.caption)
            new_mentioned = new_words


            if len(new_mentioned) > 0:
                cursor.execute("SELECT user_id, username, name FROM users WHERE username IN %s", (tuple(new_mentioned),))
                mentioned_users = cursor.fetchall()
                cursor.execute("SELECT username, name FROM users WHERE user_id=%s", (new_post.user_id,))
                user_info = cursor.fetchone()

                for mentioned_user in mentioned_users:
                    cursor.execute("SELECT * FROM notifications WHERE user_id=%s AND target_id=%s AND type=%s", (mentioned_user[0], post_id, "mention"))
                    mentioned_notification = cursor.fetchone()

                    if not mentioned_notification:
                        cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (mentioned_user[0], "mention", post_id, user_info[0], user_info[1]))
                        connection.commit()

        if old_post_caption:
            old_username_reg = re.compile(r'@([a-zA-Z0-9_]+)')
            old_words = re.split(old_username_reg, old_post_caption)
            old_mentioned = old_words

            for old_mention in old_mentioned:
                if old_mention not in new_mentioned:
                    cursor.execute("SELECT user_id FROM users WHERE username=%s", (old_mention,))
                    mentioned_user = cursor.fetchone()

                    if mentioned_user:
                        cursor.execute("DELETE FROM notifications WHERE user_id=%s AND target_id=%s AND type=%s", (mentioned_user[0], post_id, "mention"))
                        connection.commit()


        connection.close()

    def get_followed_users_posts(self, user_id: int, offset: int, limit: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE user_id IN (SELECT following_id FROM following WHERE user_id = %s) ORDER BY created_at DESC LIMIT %s OFFSET %s", (user_id, limit, offset))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        posts_users_info = get_posts_users_info(posts)

        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            user_info = posts_users_info.get(i)
            post_dict = get_post_dict(current_post, posts_media, user_info[0], user_info[1], user_info[2], user_info[3],
                                      i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts

    def favorite_post(self, post_id: int, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO favorites (user_id, post_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, post_id))
        connection.commit()
        cursor.execute("UPDATE posts SET favorite_count = favorite_count + 1 WHERE post_id = %s", (post_id,))
        connection.commit()
        cursor.execute("SELECT * FROM users left join posts on users.user_id = posts.user_id WHERE posts.post_id = %s", (post_id,))
        user_info = cursor.fetchone()
        cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
        fav_user_info = cursor.fetchone()

        if (user_info[0] != user_id):
            cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (user_info[0], "favorite", post_id, fav_user_info[2], fav_user_info[1]))
            connection.commit()
        connection.close()

    def remove_favorite_post(self, post_id: int, user_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM favorites WHERE user_id=%s AND post_id=%s", (user_id, post_id))
        connection.commit()
        cursor.execute("UPDATE posts SET favorite_count = favorite_count - 1 WHERE post_id = %s", (post_id,))
        connection.commit()
        cursor.execute("SELECT * FROM users left join posts on users.user_id = posts.user_id WHERE posts.post_id = %s", (post_id,))
        user_info = cursor.fetchone()
        cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
        fav_user_info = cursor.fetchone()

        connection.close()

    def get_favorites(self, user_id: int, offset: int, limit: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id IN (SELECT post_id FROM favorites WHERE user_id=%s) ORDER BY created_at DESC LIMIT %s OFFSET %s", (user_id, limit, offset))
        posts = cursor.fetchall()
        posts_media = get_posts_media(posts)
        posts_users_info = get_posts_users_info(posts)

        all_posts = []

        for i in range(len(posts)):
            current_post = posts[i]
            user_info = posts_users_info.get(i)
            post_dict = get_post_dict(current_post, posts_media, user_info[0], user_info[1], user_info[2], user_info[3],
                                      i)
            all_posts.append(post_dict)

        connection.close()
        return all_posts
    
    def vote_post(self, post_id: int, user_id: int, vote: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO votes (user_id, post_id, vote) VALUES (%s, %s, %s)", (user_id, post_id, vote))
        connection.commit()

        if vote == 1:
            cursor.execute("UPDATE posts SET votes_count = votes_count + 1 WHERE post_id = %s", (post_id,))
        else:
            cursor.execute("UPDATE posts SET votes_count = votes_count - 1 WHERE post_id = %s", (post_id,))

        connection.commit()

        cursor.execute("SELECT * FROM users left join posts on users.user_id = posts.user_id WHERE posts.post_id = %s", (post_id,))
        user_info = cursor.fetchone()
        cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
        vote_user_info = cursor.fetchone()

        if (user_info[0] != user_id):
            if vote == 1:
                cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (user_info[0], "up-vote", post_id, vote_user_info[2], vote_user_info[1]))
            else:
                cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (user_info[0], "down-vote", post_id, vote_user_info[2], vote_user_info[1]))
            connection.commit()

        connection.close()

    def remove_vote_post(self, post_id: int, user_id: int, vote: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM votes WHERE user_id=%s AND post_id=%s", (user_id, post_id))
        connection.commit()

        if vote == 1:
            cursor.execute("UPDATE posts SET votes_count = votes_count - 1 WHERE post_id = %s", (post_id,))
        else:
            cursor.execute("UPDATE posts SET votes_count = votes_count + 1 WHERE post_id = %s", (post_id,))

        connection.commit()

        cursor.execute("SELECT * FROM users left join posts on users.user_id = posts.user_id WHERE posts.post_id = %s", (post_id,))
        user_info = cursor.fetchone()
        cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
        vote_user_info = cursor.fetchone()

        connection.close()

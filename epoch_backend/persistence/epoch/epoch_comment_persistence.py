from ..interfaces.comment_persistence import comment_persistence
from ...objects.comment import comment
from ...business.utils import get_db_connection, get_profile_info, get_comment_dict # other comment stuff to be imported



class epoch_comment_persistence(comment_persistence):
    def __init__(self):
        pass

    def create_comment(self, new_comment: comment):
        connection = get_db_connection()
        cursor = connection.cursor()
        # Error checking need? Maybe do it in front-end?
        cursor.execute("INSERT INTO comments (post_id, user_id, comment, created_at) VALUES (%s, %s, %s, %s)", (new_comment.post_id, new_comment.user_id, new_comment.comment, new_comment.created_at))
        connection.commit()
        cursor.execute("SELECT * FROM users left join posts on users.user_id = posts.user_id WHERE posts.post_id = %s", (new_comment.post_id,))
        user_info = cursor.fetchone()
        cursor.execute("SELECT * FROM users WHERE user_id=%s", (new_comment.user_id,))
        comm_user_info = cursor.fetchone()

        if (user_info[0] != new_comment.user_id):
            cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (user_info[0], "new-comment", new_comment.post_id, comm_user_info[2], comm_user_info[1]))
            connection.commit()
        connection.close()

    # getting a single comment method?
    def get_comment(self, comm_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM comments WHERE comm_id=%s", (comm_id,))
        comment_fetched = cursor.fetchone()
        connection.close()
        return comment_fetched

    def get_comments_for_post(self, post_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM comments WHERE post_id=%s", (post_id,))
        comments = cursor.fetchall()
        all_comments = []

        for i in range(len(comments)):
            curr_comment = comments[i]
            
            username, profile_picture_url, profile_picture_type, profile_picture_name = get_profile_info(curr_comment[2])
            comment_dict = get_comment_dict(curr_comment, username, profile_picture_url, profile_picture_type, profile_picture_name)
            all_comments.append(comment_dict)

        
        connection.close()
        return all_comments


    def delete_comment(self, comm_id: int):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users LEFT JOIN comments ON users.user_id = comments.user_id LEFT JOIN posts ON comments.post_id = posts.post_id WHERE comments.comm_id = %s",(comm_id,))
        user_info = cursor.fetchone()
        cursor.execute("DELETE FROM comments WHERE comm_id=%s", (comm_id,))
        connection.commit()
        if (user_info[0] != user_info[14]):
            cursor.execute("INSERT INTO notifications (user_id, type, target_id, target_username, target_name) VALUES (%s, %s, %s, %s, %s)", (user_info[14], "delete-comment", user_info[13], user_info[2], user_info[1]))
            connection.commit()
        connection.close()


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
        cursor.execute("DELETE FROM comments WHERE comm_id=%s", (comm_id,))
        connection.commit()
        connection.close()


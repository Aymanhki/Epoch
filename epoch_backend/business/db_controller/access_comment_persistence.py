from epoch_backend.persistence.interfaces.comment_persistence import comment_persistence
from epoch_backend.objects.comment import comment
from epoch_backend.business.services import services


class access_comment_persistence(comment_persistence):
    def __init__(self):
        self.comment_persistence = services.get_comment_persistence()
    
    def create_comment(self, new_comment: comment):
        return self.comment_persistence.create_comment(new_comment)
    
    def get_comment(self, comm_id):
        return self.comment_persistence.get_comment(comm_id)

    def get_comments_for_post(self, post_id: int):
        return self.comment_persistence.get_comments_for_post(post_id)

    def delete_comment(self, post_id: int, comm_id: int):
        return self.comment_persistence.delete_comment(post_id, comm_id)
    
    
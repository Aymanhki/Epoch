from abc import ABC, abstractmethod
from ...objects.comment import comment

class comment_persistence(ABC):
    @abstractmethod
    def create_comment(self, new_comment: comment):
        pass
    
    @abstractmethod
    def get_comment(self, comm_id):
        pass

    @abstractmethod
    def get_comments_for_post(self, post_id: int):
        pass
    

    @abstractmethod
    def delete_comment(self, comm_id: int):
        pass
    
    # More methods
    # @abstractmethod
    
    # def vote_comment(self, comm_id):
    #     pass

    # def unvote_comment(self, comm_id):
    #     pass
    

class comment:
    def __init__(self, user_id, post_id, comment, created_at):
        self.post_id = post_id
        self.user_id = user_id
        self.comment = comment
        self.created_at = created_at

    def __eq__(self, other):
        return self.post_id == other.post_id and self.user_id == other.user_id and self.created_at == other.created_at


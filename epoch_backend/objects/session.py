class session:
    def __init__(self, session_id, user_id):
        self.session_id = session_id
        self.user_id = user_id

    def __eq__(self, other):
        return self.session_id == other.session_id and self.user_id == other.user_id

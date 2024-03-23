class notification:
    def __init__(self, notif_id: int, user_id: int, type: str, target_id: int, created_at: str, read: bool, target_username: str, target_name):
        self.notif_id = notif_id
        self.user_id = user_id
        self.type = type
        self.target_id = target_id
        self.created_at = created_at
        self.read = read
        self.target_username = target_username
        self.target_name = target_name


class user:
    def __init__(self, id: int, name: str, username: str, password: str, bio: str, profile_pic_id: int,
                 created_at: str, background_pic_id: int):
        self.username = username
        self.password = password
        self.id = id
        self.name = name
        self.bio = bio
        self.profile_pic_id = profile_pic_id
        self.created_at = created_at
        self.background_pic_id = background_pic_id

    def __eq__(self, other):
        return self.username == other.username and self.password == other.password

    def __str__(self):
        return f"username: {self.username}, password: {self.password}"

    def __repr__(self):
        return f"username: {self.username}, password: {self.password}"

    def __hash__(self):
        return hash((self.username, self.password))

class user:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __eq__(self, other):
        return self.username == other.username and self.password == other.password

    def __str__(self):
        return f"username: {self.username}, password: {self.password}"

    def __repr__(self):
        return f"username: {self.username}, password: {self.password}"

    def __hash__(self):
        return hash((self.username, self.password))
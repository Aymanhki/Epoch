from epoch_backend.persistence.interfaces.user_persistence import user_persistence
from epoch_backend.objects.user import user
import psycopg2
from psycopg2 import sql

class epoch_user_persistence(user_persistence):
    def __init__(self, db_path):
        pass

    def get_user(self, username: str):
        pass

    def add_user(self, new_user: user):
        pass

    def remove_user(self, username: str):
        pass

    def update_user(self, user_to_update: user):
        pass

    def get_all_users(self):
        pass

    def validate_login(self, username: str, password: str):
        pass


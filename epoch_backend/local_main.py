import os
import sys

os.chdir(os.path.dirname(os.path.realpath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from business.webserver import webserver
from business.utils import start_local_db_tables
from business.db_controller.access_user_persistence import access_user_persistence
from epoch_backend.objects.user import user

def populate_db():
    print("hello")
    username = "User1"
    password = "password"
    bio = "random bio about things"
    name = "John Doe"
    user_id = 0

    if access_user_persistence().get_user(username) is None:
        new_user = user(None, name, username, password, bio, None, None)
        user_id = access_user_persistence().add_user(new_user)

    username = "User2"
    password = "password"
    bio = "random bio about things"
    name = "Quick Fox"

    if access_user_persistence().get_user(username) is None:
        new_user = user(None, name, username, password, bio, None, None)
        user_id = access_user_persistence().add_user(new_user)

    username = "User3"
    password = "password"
    bio = "random bio about things"
    name = "B Obama"

    if access_user_persistence().get_user(username) is None:
        new_user = user(None, name, username, password, bio, None, None)
        user_id = access_user_persistence().add_user(new_user)

    print(access_user_persistence().get_all_users(user_id))

def main():
    start_local_db_tables()
    populate_db()
    webserver().run()

if __name__ == "__main__":
    main()
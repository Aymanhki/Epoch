import unittest
import requests
import uuid
import base64
import json
from pathlib import Path
import os
import time
import threading


session_id: str = None
user_id: int = None
TEST_PROFILE_PIC_BINARY = bytearray(open(Path(__file__).parent / 'test.jpg', 'rb').read())
EXTREME_TEST_RANGE = 10
EXTREM_TEST_UPLOAD_RANGE = 3
SERVER_WAIT_TIME = 5

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

from epoch_backend.business.webserver import webserver
from epoch_backend.business.utils import start_db_tables, get_google_credentials


class following_integration_tests(unittest.TestCase):
    server_thread = None
    web_server = None
    username = str(uuid.uuid4())
    password = str(uuid.uuid4())
    name = str(uuid.uuid4())
    bio = str(uuid.uuid4())
    user_to_follow_id = None

    @classmethod
    def setUpClass(cls):
        start_db_tables()
        get_google_credentials()
        cls.web_server = webserver()
        cls.server_thread = threading.Thread(target=cls.web_server.run, daemon=True)
        cls.server_thread.start()
        time.sleep(1)

    @classmethod
    def tearDownClass(cls):
        cls.web_server.stop()
        cls.server_thread.join(timeout=SERVER_WAIT_TIME)
        time.sleep(1)

    def set_session_id(self, value: str):
        global session_id
        session_id = value

    def set_user_id(self, value: int):
        global user_id
        user_id = value

    def get_session_id(self):
        global session_id
        return session_id

    def get_user_id(self):
        global user_id
        return user_id
    
    def set_follow_id(self, value: int):
        global user_to_follow_id
        user_to_follow_id = value

    def get_follow_id(self):
        global user_to_follow_id
        return user_to_follow_id

    def test_0_setup(self):
        print("Registering user...")
        response = requests.post('http://localhost:8080/api/register/',
                                 json={'username': self.username, 'password': self.password, 'name': self.name,
                                       'bio': self.bio})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        self.set_user_id(response_json['user_id'])
        print(response_json)
        print("User registered.")

        print("Logging in...")
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text.split('=')[0], 'epoch_session_id')
        self.assertEqual(response.headers['Set-Cookie'].split('=')[1].split(';')[0], response.text.split('=')[1])
        self.set_session_id(response.text.split('=')[1])
        print(self.get_session_id())
        print("Logged in.")

    def test_1_get_all_user(self):
        print("Getting all followable acccounts...")
        response = requests.get('http://localhost:8080/api/follow/accountList/', cookies={'epoch_session_id': self.get_session_id()})
        print("response:", response)
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        print (response_json[0]["user_id"])
        if len(response_json) > 0:
            self.set_follow_id(int(response_json[0]["user_id"]))
            print("Got all followable acccounts.")
        else:
            print("tests will not work with no other accounts in the db")
            self.assertTrue(False)
        

    def test_2_get_following_empty(self):
        print("Getting empty following list...")
        response = requests.get('http://localhost:8080/api/follow/followingList/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(len(response_json), 0)
        print("Got empty following list.")

    def test_3_follow_user(self):
        print("Following user...")
        response = requests.post('http://localhost:8080/api/follow/follow/',
                                 json={'userToFollow': self.get_follow_id()},
                                  cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in  response_json)
        print("Followed user.")

    def test_4_get_following(self):
        print("Getting following list...")
        response = requests.get('http://localhost:8080/api/follow/followingList/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertNotEqual(len(response_json), 0)
        self.assertEqual(response_json[0]['following_id'], self.get_follow_id())
        self.assertFalse('user_id' in  response_json)
        print("Got following list.")

    def test_5_get_followers(self):
        # not implemented yet
        pass

    def test_6_dupe_follow(self):
        print("Attempting dupe follow...")
        response = requests.post('http://localhost:8080/api/follow/follow/',
                                 json={'userToFollow': self.user_to_follow_id},
                                  cookies={'epoch_session_id': self.get_session_id()})
        self.assertNotEqual(response.status_code, 200)
        print("Attempted dupe follow.")

    def test_7_unfollow_user(self):
        print("Unfollowing user...")
        response = requests.post('http://localhost:8080/api/follow/unfollow/',
                                 json={'userToUnfollow': self.get_follow_id()},
                                  cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        response = requests.get('http://localhost:8080/api/follow/followingList/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(len(response_json), 0)
        print("Unfollowed user.")

    def test_8_delete(self):
        print("Deleting user...")
        response = requests.delete('http://localhost:8080/api/delete/userId/', json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        print("User deleted.")


if __name__ == '__main__':
    unittest.main()
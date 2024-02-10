import unittest
import requests
import uuid
import base64
import json
from pathlib import Path
import os
import time
import threading
import pytest
import multiprocessing



session_id: str = None
user_id: int = None
TEST_PROFILE_PIC_BINARY = bytearray(open(Path(__file__).parent / 'test.jpg', 'rb').read())
EXTREME_TEST_RANGE = 10

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

from epoch_backend.business.webserver import webserver
from epoch_backend.business.utils import start_db_tables, get_google_credentials


class webserver_tests(unittest.TestCase):
    server_thread = None
    web_server = None
    username = str(uuid.uuid4())
    password = str(uuid.uuid4())
    name = str(uuid.uuid4())
    bio = str(uuid.uuid4())

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
        cls.server_thread.join()
        pytest.exit('Server stopped')

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

    def test_0_register_user(self):
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

    def test_1_register_existing_user(self):
        print("Registering existing user...")
        response = requests.post('http://localhost:8080/api/register/', json={'username': self.username, 'password': self.password, 'name': self.name, 'bio': self.bio})
        self.assertEqual(response.status_code, 409)
        print(response.text)
        print("Existing user not registered.")

    def test_2_login_request(self):
        print("Logging in...")
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text.split('=')[0], 'epoch_session_id')
        self.assertEqual(response.headers['Set-Cookie'].split('=')[1].split(';')[0], response.text.split('=')[1])
        self.set_session_id(response.text.split('=')[1])
        print(self.get_session_id())
        print("Logged in.")

    def test_3_get_user_info(self):
        print("Getting user info...")
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json['username'], self.username)
        self.assertEqual(response_json['name'], self.name)
        self.assertEqual(response_json['bio'], self.bio)
        self.assertEqual(response_json['id'], self.get_user_id())
        self.assertEqual(response_json['profile_pic_id'], 1)
        print(response_json)
        print("Got user info.")

    def test_4_delete_user(self):
        print("Deleting user...")
        response = requests.delete('http://localhost:8080/api/delete/user/', json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        print("User deleted.")

    def test_5_login_nonexistent_user(self):
        print("Logging in nonexistent user...")
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 401)
        print(response.text)
        print("Nonexistent user not logged in.")

    def test_6_get_user_info_nonexistent_user(self):
        print("Getting info for nonexistent user...")
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 401)
        print(response.text)
        print("Got no info for nonexistent user.")

    def test_7_delete_nonexistent_user(self):
        print("Deleting nonexistent user...")
        response = requests.delete('http://localhost:8080/api/delete/user/', json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 401)
        print(response.text)
        print("Nonexistent user not deleted.")

    def test_8_register_user_with_picture(self):
        print("Registering user with picture...")
        response = requests.post('http://localhost:8080/api/register/', json={'username': self.username, 'password': self.password, 'name': self.name, 'bio': self.bio})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        self.set_user_id(response_json['user_id'])
        response = requests.post('http://localhost:8080/api/upload/profile/1/', data=TEST_PROFILE_PIC_BINARY, headers={'File-Name': 'test.jpg', 'Content-Type': 'image/jpeg', 'User-Id': str(self.get_user_id())})
        assert (response.status_code == 200)
        response = requests.post('http://localhost:8080/api/login/', json={'username': self.username, 'password': self.password})
        assert (response.status_code == 200)
        self.set_session_id(response.text.split('=')[1])
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': self.get_session_id()})
        assert (response.status_code == 200)
        response_json = response.json()
        assert (response_json['username'] == self.username)
        assert (response_json['name'] == self.name)
        assert (response_json['bio'] == self.bio)
        assert (response_json['id'] == self.get_user_id())
        profile_pic_base64 = response_json['profile_pic_data']
        assert (profile_pic_base64 is not None)
        profile_pic_binary = base64.b64decode(profile_pic_base64)
        original_pic_base64 = base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8')
        assert (original_pic_base64 == profile_pic_base64)
        response = requests.delete('http://localhost:8080/api/delete/user/', json={'userId': self.get_user_id()}, cookies={'epoch_session_id': self.get_session_id()})
        assert (response.status_code == 200)
        print("User with picture registered and deleted.")

    def register_user(self, i, usernames, passwords, names, bios, session_ids, user_ids, media_ids):
        print(f"Registering user {i}...")
        response = requests.post('http://localhost:8080/api/register/', json={'username': usernames[i], 'password': passwords[i], 'name': names[i], 'bio': bios[i]})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        user_ids[i] = response_json['user_id']
        print(response_json)
        print(f"User {i} registered.")

    def upload_profile_pic(self, i, usernames, user_ids, media_ids):
        print(f"Uploading profile picture for user {i}...")
        response = requests.post('http://localhost:8080/api/upload/profile/1/', data=TEST_PROFILE_PIC_BINARY, headers={'File-Name': 'test.jpg', 'Content-Type': 'image/jpeg', 'User-Id': str(user_ids[i])})
        self.assertEqual(response.status_code, 200)
        media_ids[i] = json.loads(response.text)['media_id']
        print(f"Profile picture uploaded for user {i}.")

    def login_user(self, i, usernames, passwords, session_ids):
        print(f"Logging in user {i}...")
        response = requests.post('http://localhost:8080/api/login/', json={'username': usernames[i], 'password': passwords[i]})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text.split('=')[0], 'epoch_session_id')
        self.assertEqual(response.headers['Set-Cookie'].split('=')[1].split(';')[0], response.text.split('=')[1])
        session_ids[i] = response.text.split('=')[1]
        print(session_ids[i])
        print(f"User {i} logged in.")

    def get_user_info(self, i, usernames, names, bios, user_ids, media_ids, session_ids):
        print(f"Getting user info for user {i}...")
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': session_ids[i]})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json['username'], usernames[i])
        self.assertEqual(response_json['name'], names[i])
        self.assertEqual(response_json['bio'], bios[i])
        self.assertEqual(response_json['id'], user_ids[i])
        self.assertEqual(response_json['profile_pic_id'], media_ids[i])
        self.assertEqual(response_json['profile_pic_data'], base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8'))
        print(f"Got user info for user {i}.")

    def delete_user(self, i, user_ids, session_ids):
        print(f"Deleting user {i}...")
        response = requests.delete('http://localhost:8080/api/delete/user/', json={'userId': user_ids[i]}, cookies={'epoch_session_id': session_ids[i]})
        self.assertEqual(response.status_code, 200)
        print(f"User {i} deleted.")

    def test_9_all_tests_extreme(self):
        usernames = [ str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE) ]
        passwords = [ str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE) ]
        names = [ str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE) ]
        bios = [ str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE) ]
        session_ids = [ None for i in range(EXTREME_TEST_RANGE) ]
        user_ids = [ None for i in range(EXTREME_TEST_RANGE) ]
        media_ids = [ None for i in range(EXTREME_TEST_RANGE) ]

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.register_user, args=(i, usernames, passwords, names, bios, session_ids, user_ids, media_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.upload_profile_pic, args=(i, usernames, user_ids, media_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.login_user, args=(i, usernames, passwords, session_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.get_user_info, args=(i, usernames, names, bios, user_ids, media_ids, session_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.delete_user, args=(i, user_ids, session_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()


if __name__ == '__main__':
    unittest.main()

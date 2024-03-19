import datetime
import signal
import subprocess
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
from epoch_backend.business.utils import start_db_tables, get_google_credentials, terminate_processes_on_port


class webserver_tests(unittest.TestCase):
    unittest.TestLoader.sortTestMethodsUsing = None
    server_thread = None
    web_server = None
    # allow us to go in manually if something happens when deleting this account
    username = "WebserverTests" # str(uuid.uuid4())
    password = "Newuser1!" # str(uuid.uuid4())
    name = str(uuid.uuid4())
    bio = str(uuid.uuid4())
    post_creation_time = '2024-02-22T06:36:12.653Z'
    user_to_follow_id = None

    @classmethod
    def setUpClass(cls):
        terminate_processes_on_port(3000)
        terminate_processes_on_port(8080)
        start_db_tables()
        get_google_credentials()
        cls.web_server = webserver()
        cls.server_thread = threading.Thread(target=cls.web_server.run, daemon=True)
        cls.server_thread.start()
        time.sleep(1)

    @classmethod
    def tearDownClass(cls):
        global user_id
        global session_id
        response = requests.delete('http://localhost:8080/api/delete/userId/', 
                                   json={'userId': user_id},
                                   cookies={'epoch_session_id': session_id})
        cls.web_server.stop()
        cls.server_thread.join(timeout=SERVER_WAIT_TIME)
        terminate_processes_on_port(3000)
        terminate_processes_on_port(8080)
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

    def test_a_register_user(self):
        # delete our test account if its for some reason still in db
        response = requests.delete('http://localhost:8080/api/delete/userId/', 
                                   json={'userId': user_id},
                                   cookies={'epoch_session_id': session_id})
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

    def test_b_register_existing_user(self):
        print("Registering existing user...")
        response = requests.post('http://localhost:8080/api/register/',
                                 json={'username': self.username, 'password': self.password, 'name': self.name,
                                       'bio': self.bio})
        self.assertEqual(response.status_code, 409)
        print(response.text)
        print("Existing user not registered.")

    def test_c_login_request(self):
        print("Logging in...")
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text.split('=')[0], 'epoch_session_id')
        self.assertEqual(response.headers['Set-Cookie'].split('=')[1].split(';')[0], response.text.split('=')[1])
        self.set_session_id(response.text.split('=')[1])
        print(self.get_session_id())
        print("Logged in.")

    def test_d_get_user_info(self):
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

    def test_e_get_all_user(self):
        print("Getting all followable acccounts...")
        response = requests.get('http://localhost:8080/api/follow/accountList/',
                                cookies={'epoch_session_id': self.get_session_id()})
        print("response:", response)
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        print(response_json[0]["user_id"])
        if len(response_json) > 0:
            self.set_follow_id(int(response_json[0]["user_id"]))
            print("Got all followable acccounts.")
        else:
            self.fill_empty_list() # if no other users in db create one to test on

    def test_f_get_following_empty(self):
        print("Getting empty following list...")
        response = requests.get('http://localhost:8080/api/follow/followingList/',
                                cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(len(response_json), 0)
        print("Got empty following list.")

    def test_g_follow_user(self):
        print("Following user...")
        if self.get_follow_id() == None: # there are no users to follow
            self.fill_empty_list()
        response = requests.post('http://localhost:8080/api/follow/follow/',
                                 json={'userToFollow': self.get_follow_id()},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        print("Followed user.")

    def test_h_get_following(self):
        print("Getting following list...")
        if self.get_follow_id() == None: # there are no users to follow
            self.fill_empty_list()
        response = requests.post('http://localhost:8080/api/follow/followingList/',
                                 json={'target': "self"},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertNotEqual(len(response_json), 0)
        self.assertEqual(response_json[0]['following_id'], self.get_follow_id())
        self.assertFalse('user_id' in response_json)

        response = requests.post('http://localhost:8080/api/follow/followingList/',
                                 json={'target': '1'},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        print("Got following list.")

    def test_i_get_followers(self):
        print("Getting follower list...")
        if self.get_follow_id() == None: # there are no users to follow
            self.fill_empty_list()
        response = requests.post('http://localhost:8080/api/follow/followingList/',
                                 json={'target': "self"},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response = requests.post('http://localhost:8080/api/follow/followingList/',
                                 json={'target': "1"},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        print("Got follower list...")

    def test_j_dupe_follow(self):
        print("Attempting dupe follow...")
        if self.get_follow_id() == None: # there are no users to follow
            self.fill_empty_list()
        response = requests.post('http://localhost:8080/api/follow/follow/',
                                 json={'userToFollow': self.user_to_follow_id},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertNotEqual(response.status_code, 200)
        print("Attempted dupe follow.")

    def test_k_unfollow_user(self):
        print("Unfollowing user...")
        if self.get_follow_id() == None: # there are no users to follow
            self.fill_empty_list()
        response = requests.post('http://localhost:8080/api/follow/unfollow/',
                                 json={'userToUnfollow': self.get_follow_id()},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        response = requests.get('http://localhost:8080/api/follow/followingList/',
                                cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(len(response_json), 0)
        print("Unfollowed user.")

    def test_l_delete_user(self):
        print("Deleting user...")
        if self.get_user_id == None:
            self.register_test_user()
        response = requests.delete('http://localhost:8080/api/delete/userId/', json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        print("User deleted.")

    def test_m_login_nonexistent_user(self):
        print("Logging in nonexistent user...")
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': str(uuid.uuid4()), 'password': self.password})
        self.assertEqual(response.status_code, 401)
        print(response.text)
        print("Nonexistent user not logged in.")

    def test_n_get_user_info_nonexistent_user(self):
        print("Getting info for nonexistent user...")
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 401)
        print(response.text)
        print("Got no info for nonexistent user.")

    def test_o_delete_nonexistent_user(self):
        print("Deleting nonexistent user...")
        response = requests.delete('http://localhost:8080/api/delete/userId/', json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 401)
        print(response.text)
        print("Nonexistent user not deleted.")
    
    def test_p_register_user_with_picture(self):
        # Added additional tests to cover other methods with profiles with profile photos
        print("Registering user with picture...")
        response = requests.post('http://localhost:8080/api/register/',
                                 json={'username': self.username, 'password': self.password, 'name': self.name,
                                       'bio': self.bio})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        self.set_user_id(response_json['user_id'])

        body = {
            "fileData": base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8'),
            "fileName": 'test.jpg',
            "fileType": 'image/jpeg',
            "userId": self.get_user_id()
        }
        body = json.dumps(body)
        response = requests.post('http://localhost:8080/api/upload/profile/1/', data=body)
        response_json = response.json()
        media_id = response_json['media_id']
        assert (response.status_code == 200)
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': self.username, 'password': self.password})
        assert (response.status_code == 200)
        self.set_session_id(response.text.split('=')[1])
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': self.get_session_id()})
        assert (response.status_code == 200)
        response_json = response.json()
        assert (response_json['username'] == self.username)
        assert (response_json['name'] == self.name)
        assert (response_json['bio'] == self.bio)
        assert (response_json['id'] == self.get_user_id())
        profile_pic = response_json['profile_pic_data']
        assert (profile_pic is not None)
        print("Testing getting profile with profile picture") # get a user with a profile pic 's info
        response = requests.get('http://localhost:8080/api/user/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"User-Id": self.username})
        self.assertEqual(response.status_code, 200)
        print("Testing updating profile with profile picture")  # update a profile with a profile pic and a background pic
        response = requests.post('http://localhost:8080/api/user/', 
                                cookies = {'epoch_session_id': self.get_session_id()},
                                json = {'username': self.username, 'userID': self.get_user_id(), 'displayname': 'cEDRICtESTS', 'bio':'some new bio', 
                                      'password': self.password, 'created_at': 'sometime?', 'profile_pic_id': media_id, 'background_pic_id':2,
                                      'new_profile_pic': base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8') ,'new_profile_pic_type':'image/jpeg',
                                      'new_profile_pic_name': 'test.jpg','new_background_pic':base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8'),
                                      'new_background_pic_type':'image/jpeg','new_background_pic_name': 'test.jpg'})
        self.assertEqual(response.status_code, 200)
        # delete a profile with a profile pic
        response = requests.delete('http://localhost:8080/api/delete/userId/', json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
        assert (response.status_code == 200)
        print("User with picture registered and deleted.")

    def register_user(self, i, usernames, passwords, names, bios, session_ids, user_ids, media_ids):
        print(f"Registering user {i}...")
        response = requests.post('http://localhost:8080/api/register/',
                                 json={'username': usernames[i], 'password': passwords[i], 'name': names[i],
                                       'bio': bios[i]})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        user_ids[i] = response_json['user_id']
        print(response_json)
        print(f"User {i} registered.")

    def upload_profile_pic(self, i, usernames, user_ids, media_ids):
        print(f"Uploading profile picture for user {i}...")

        body = {
            "fileData": base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8'),
            "fileName": 'test.jpg',
            "fileType": 'image/jpeg',
            "userId": user_ids[i]
        }

        body = json.dumps(body)

        response = requests.post('http://localhost:8080/api/upload/profile/1/', data=body)
        self.assertEqual(response.status_code, 200)
        media_ids[i] = json.loads(response.text)['media_id']
        print(f"Profile picture uploaded for user {i}.")

    def login_user(self, i, usernames, passwords, session_ids):
        print(f"Logging in user {i}...")
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': usernames[i], 'password': passwords[i]})
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
        print(f"Got user info for user {i}.")

    def delete_user(self, i, user_ids, session_ids):
        print(f"Deleting user {i}...")
        response = requests.delete('http://localhost:8080/api/delete/userId/', json={'userId': user_ids[i]},
                                   cookies={'epoch_session_id': session_ids[i]})
        self.assertEqual(response.status_code, 200)
        print(f"User {i} deleted.")

    def test_q_load_test(self):
        usernames = [str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE)]
        passwords = [str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE)]
        names = [str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE)]
        bios = [str(uuid.uuid4()) for i in range(EXTREME_TEST_RANGE)]
        session_ids = [None for i in range(EXTREME_TEST_RANGE)]
        user_ids = [None for i in range(EXTREME_TEST_RANGE)]
        media_ids = [None for i in range(EXTREME_TEST_RANGE)]

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.register_user, args=(
            i, usernames, passwords, names, bios, session_ids, user_ids, media_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()

        threads = []
        for i in range(EXTREM_TEST_UPLOAD_RANGE):
            threads.append(threading.Thread(target=self.upload_profile_pic, args=(i, usernames, user_ids, media_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREM_TEST_UPLOAD_RANGE):
            threads[i].join()

        if EXTREME_TEST_RANGE > EXTREM_TEST_UPLOAD_RANGE:
            start_index = EXTREM_TEST_UPLOAD_RANGE

            for i in range(start_index, EXTREME_TEST_RANGE):
                media_ids[i] = 1

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.login_user, args=(i, usernames, passwords, session_ids)))
            threads[i].daemon = True
            threads[i].start()

        for i in range(EXTREME_TEST_RANGE):
            threads[i].join()

        threads = []
        for i in range(EXTREME_TEST_RANGE):
            threads.append(threading.Thread(target=self.get_user_info,
                                            args=(i, usernames, names, bios, user_ids, media_ids, session_ids)))
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

    def register_test_user(self):
        # create a test account if it already exist log in to it
        response = requests.post('http://localhost:8080/api/register/',
                                 json={'username': self.username, 'password': self.password, 
                                       'name': self.name, 'bio': self.bio})
        if response.status_code == 200:
            response_json = response.json()
            self.set_user_id(response_json['user_id'])
        response = requests.post('http://localhost:8080/api/login/',
                                 json={'username': self.username, 'password': self.password})
        self.set_session_id(response.text.split('=')[1])
        response = requests.get('http://localhost:8080/api/user/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"User-Id": self.username})
        response_json = response.json()
        self.set_user_id(response_json["id"])

    def delete_test_user(self):
        response = requests.delete('http://localhost:8080/api/delete/userId/', 
                                   json={'userId': self.get_user_id()},
                                   cookies={'epoch_session_id': self.get_session_id()})
    
    def make_post(self):
        print("creating a post!")
        today = datetime.date.today()
        response = requests.post('http://localhost:8080/api/post/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                json={'postText': 'someText #webservertest', 'file': base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8'),
                                       'fileType': 'image/jpeg', 'fileName': 'test.jpg', 'postNow': 'true', 'selectedDate': self.post_creation_time,
                                       'createdAt': self.post_creation_time, 'username': self.username })
        self.assertEqual(response.status_code, 200)
        print("Created a post!")

    def delete_post(self):
        print("Deleting a post")
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        for post in response_json:
            response = requests.delete('http://localhost:8080/api/user/posts/',
                                       headers={'Post-Id': str(post["post_id"]), 'User-Id': str(self.get_user_id())})
            self.assertEqual(response.status_code, 200)

    def fill_empty_list(self):
        response = requests.post('http://localhost:8080/api/register/',
                                 json={'username': 'cedric', 'password': 'Newuser1!', 
                                       'name': 'Cedric', 'bio': 'some bio'})
        if response.status_code == 200:
            response_json = response.json()
            self.set_follow_id(response_json["user_id"])
        else:
            response = requests.get('http://localhost:8080/api/user/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"User-Id": 'cedric'})
            response_json = response.json()
            self.set_follow_id(response_json['id'])
            self.assertEqual(response.status_code, 200)

    def test_z01_get_username_info(self): # GET "/api/user/" - get user info
        self.register_test_user()
        print("getting user info")
        response = requests.get('http://localhost:8080/api/user/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"User-Id": self.username})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json["username"], self.username)
        response = requests.get('http://localhost:8080/api/user/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"User-id": "not a real username"})
        self.assertEqual(response.status_code, 400)

    def test_z02_update_user(self): # POST "/api/user/": updateUser(userId, newUserInfo) 
        self.register_test_user()
        print("updating user profile")
        response = requests.post('http://localhost:8080/api/user/', 
                                cookies = {'epoch_session_id': self.get_session_id()},
                                json = {'username': self.username, 'userID': self.get_user_id(), 'displayname': 'cEDRICtESTS', 'bio':'some new bio', 
                                      'password': self.password, 'created_at': 'sometime?', 'profile_pic_id': 1, 'background_pic_id':2})
        self.assertEqual(response.status_code, 200)
        print("checking update is successful")
        response = requests.get('http://localhost:8080/api/user/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"User-Id": self.username})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json["name"], 'cEDRICtESTS')
        #print("Updating with missing fields")
        #response = requests.post('http://localhost:8080/api/user/', 
        #                       cookies = {'epoch_session_id': self.get_session_id()},
        #                        json = {'username': self.username, 'userID': self.get_user_id()})
        #self.assertEqual(response.status_code, 400) # missing fields
    
    def test_z03_create_post(self): # POST "/api/post/" 
        self.register_test_user()
        self.make_post()
        self.delete_post()
    
    def test_z04_hashtag_tests(self): # GET "/api/post/hashtag/" - Get all post with hash tag
        self.register_test_user()
        self.make_post()
        print("Getting all post with the hashtag")
        response = requests.get('http://localhost:8080/api/post/hashtag/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"Hashtag": "webservertest"})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json[0]["username"], self.username)
        print("Getting non used hashtag")
        response = requests.get('http://localhost:8080/api/post/hashtag/', 
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={"Hashtag": str(uuid.uuid4())})
        response_json = response.json()
        self.assertEqual(response_json, [])
        response = requests.get('http://localhost:8080/api/post/hashtag/', 
                                cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 400)
        self.delete_post()

    def test_z05_updating_posts(self): # PUT "/api/user/posts/" - UPDATE POST
        self.register_test_user()
        self.make_post()
        print("updating a post without media")
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        
        response = requests.put('http://localhost:8080/api/user/posts/',
                                    cookies={'epoch_session_id': self.get_session_id()},
                                    headers={'User-Id': str(self.get_user_id())},
                                    json={'postId': response_json[0]["post_id"], 'username': self.username,
                                          'fileName': '', 'fileType': '', 'file': '', 'postNow': 'true', 'postText': 'updated text #webservertest',
                                           'selectedDate': self.post_creation_time, 'createdAt': self.post_creation_time, 'oldFileRemoved': 'false'})
        self.assertEqual(response.status_code, 200)
        # now update a post's media
        print("updating a post with media")
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        response = requests.put('http://localhost:8080/api/user/posts/',
                                    cookies={'epoch_session_id': self.get_session_id()},
                                    headers={'User-Id': str(self.get_user_id())},
                                    json={'postId': response_json[0]["post_id"], 'username': self.username,
                                            'fileName': 'test.jpg', 'fileType': 'image/jpeg', 'file': base64.b64encode(TEST_PROFILE_PIC_BINARY).decode('utf-8'),
                                            'postNow': 'true', 'postText': 'updated text #webservertest',
                                            'selectedDate': self.post_creation_time, 'createdAt': self.post_creation_time, 'oldFileRemoved': 'true'})
        self.assertEqual(response.status_code, 200)
        self.delete_post()
        print("finished updating posts")

    def test_z06_get_followed_posts(self): # GET "/api/followed/posts/"
        self.fill_empty_list()
        self.register_test_user()
        print("Getting followed posts")
        response = requests.get('http://localhost:8080/api/followed/posts/', # empty list
                                 headers={'User-Id': str(self.get_user_id())},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json, [])
        response = requests.post('http://localhost:8080/api/follow/follow/',
                                 json={'userToFollow': self.get_follow_id()},
                                 cookies={'epoch_session_id': self.get_session_id()})
        response = requests.get('http://localhost:8080/api/followed/posts/', # not empty list
                                 headers={'User-Id': str(self.get_user_id())},
                                 cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response = requests.get('http://localhost:8080/api/followed/posts/',
                                cookies={'epoch_session_id': self.get_session_id()}) # bad request
        self.assertEqual(response.status_code, 400)
        response = requests.post('http://localhost:8080/api/follow/unfollow/',
                                 json={'userToFollow': self.get_follow_id()},
                                 cookies={'epoch_session_id': self.get_session_id()})

    def test_z07_favorite_post_test(self): # POST GET DELETE "/api/favorite/posts/"
        self.register_test_user()
        self.make_post()
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        postId = response_json[0]["post_id"]
        print("Favoriting a post")
        response = requests.post('http://localhost:8080/api/favorite/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()), 'Post-Id': str(postId)})
        self.assertEqual(response.status_code, 200)
        print("Getting favorite posts")
        response = requests.get('http://localhost:8080/api/favorite/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id())})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json[0]['post_id'], postId)
        print("removing favorited post")
        response = requests.delete('http://localhost:8080/api/favorite/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()), 'Post-Id': str(postId)})
        self.assertEqual(response.status_code, 200)
        self.delete_post()
        print("testing bad requests")
        response = requests.delete('http://localhost:8080/api/favorite/posts/',
                                cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 400)
        response = requests.post('http://localhost:8080/api/favorite/posts/',
                                cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 400)
        response = requests.get('http://localhost:8080/api/favorite/posts/',
                                cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 400)
    
    def test_z08_post_comments_test(self): # POST DELETE GET "/api/comments/post"
        self.register_test_user()
        self.make_post()
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        postId = response_json[0]["post_id"]
        print("Creating a new comment on our own post")
        response = requests.post('http://localhost:8080/api/comments/post/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                json={'username':self.username, 'post_id': postId, 'comment': 'Hello World!', 'createdAt': self.post_creation_time})
        self.assertEqual(response.status_code, 200)
        print("Getting all comments on our post")
        response = requests.get('http://localhost:8080/api/comments/get/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'Post-Id': str(postId)})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json["comments"][0]["comment"], "Hello World!")
        commentId = response_json["comments"][0]["comm_id"]
        print("Deleting our comment")
        response = requests.delete('http://localhost:8080/api/comments/delete/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'Post-Id': str(postId), 'Comment-Id': str(commentId), 'User-Id': str(self.get_user_id())})
        self.assertEqual(response.status_code, 200)
        self.delete_post()
    
    def test_z09_post_votes_test(self): # POST DELETE "/api/vote/post/"
        self.register_test_user()
        self.make_post()
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        postId = response_json[0]["post_id"]
        print("voting positively on a post")
        response = requests.post('http://localhost:8080/api/vote/post/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()), 'Post-Id': str(postId)},
                                json={'vote': "1"})
        self.assertEqual(response.status_code, 200)
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json[0]["votes_count"], 1)
        print("deleting our vote")
        response = requests.delete('http://localhost:8080/api/vote/post/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()), 'Post-Id': str(postId)},
                                json={'vote': "1"})
        self.assertEqual(response.status_code, 200)
        response = requests.get('http://localhost:8080/api/user/posts/',
                                cookies={'epoch_session_id': self.get_session_id()},
                                headers={'User-Id': str(self.get_user_id()) })
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json[0]["votes_count"], 0)
        self.delete_post()

if __name__ == '__main__':
    unittest.main()


# python -m pytest ./epoch_backend/tests/webserver_tests.py
# python -m pytest --cov-config=.coveragerc --cov=epoch_backend -rA --color=yes --disable-warnings --disable-pytest-warnings --cov-report=html ./epoch_backend/tests/webserver_tests.py
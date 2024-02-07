import unittest
import requests
import uuid
import subprocess
import time

session_id: str = None
user_id: int = None

class webserver_tests(unittest.TestCase):
    username = str(uuid.uuid4())
    password = str(uuid.uuid4())
    name = str(uuid.uuid4())
    bio = str(uuid.uuid4())

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
        response = requests.post('http://localhost:8080/api/register/', json={'username': self.username, 'password': self.password, 'name': self.name, 'bio': self.bio})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue('user_id' in response_json)
        self.set_user_id(response_json['user_id'])

    def test_1_login_request(self):
        response = requests.post('http://localhost:8080/api/login/', json={'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text.split('=')[0], 'epoch_session_id')
        self.assertEqual(response.headers['Set-Cookie'].split('=')[1].split(';')[0], response.text.split('=')[1])
        self.set_session_id(response.text.split('=')[1])

    def test_2_get_user_info(self):
        response = requests.get('http://localhost:8080/api/login/', cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertEqual(response_json['username'], self.username)
        self.assertEqual(response_json['name'], self.name)
        self.assertEqual(response_json['bio'], self.bio)
        self.assertEqual(response_json['id'], self.get_user_id())
        self.assertEqual(response_json['profile_pic_id'], 1)

    def test_3_delete_user(self):
        response = requests.delete('http://localhost:8080/api/delete/user/', json={'userId': self.get_user_id()}, cookies={'epoch_session_id': self.get_session_id()})
        self.assertEqual(response.status_code, 200)
        response = requests.get('http://localhost:8080/api/login', json={'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, 401)


if __name__ == '__main__':
    unittest.main()


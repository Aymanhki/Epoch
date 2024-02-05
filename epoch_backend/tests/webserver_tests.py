import unittest

import sys
import os

# Get the current working directory (assuming the script is run from the 'tests' directory)
current_dir = os.path.dirname(os.path.realpath(__file__))

# Append the path to the 'business' directory to the Python path
utils_path = os.path.join(current_dir, '..')
sys.path.append(utils_path)

webserver_path = os.path.join(current_dir, '..')
sys.path.append(webserver_path)

from utils import start_db_tables, get_google_credentials
from webserver import webserver


class webserver_tests(unittest.TestCase):

    def setUp(self):
        start_db_tables()
        get_google_credentials()
        self.server = webserver()
        self.server.run()

    def tearDown(self):
        self.server.stop()

    def test_get_request(self):
        response = self._make_request("GET", "/api/login/", data='{"username": "aaa"}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"Expected response content")

    # def test_post_request(self):
    #     # Test handling of POST request
    #     data = {"key": "value"}
    #     response = self._make_request("POST", "/api/endpoint", data)
    #     self.assertEqual(response.status_code, 201)
    #     self.assertEqual(response.content, b"Expected response content")


    def _make_request(self, method, path, data=None):
        # Helper method to make HTTP requests to the server
        import requests

        url = f"http://localhost:your_server_port{path}"  # Modify the URL accordingly
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)

        return response

if __name__ == '__main__':
    unittest.main()

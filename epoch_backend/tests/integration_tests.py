# import unittest
# import uuid
# import os
# import time
# from pathlib import Path
# import subprocess
# from selenium import webdriver
# import signal
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# import requests
# import json
# import pytest


# TEST_PROFILE_PIC_BINARY = bytearray(open(Path(__file__).parent / 'test.jpg', 'rb').read())
# script_dir = os.path.dirname(os.path.abspath(__file__))
# os.chdir(script_dir)

# servers_wait_time = 10
# default_element_wait_timeout = 60
# session_id = None


# from epoch_backend.business.utils import terminate_processes_on_port


# def set_session_id(value: str):
#     global session_id
#     session_id = value


# class integration_tests(unittest.TestCase):
#     server_process = None
#     web_server = None
#     frontend_process = None
#     driver = None
#     frontend_dir = os.path.join(os.pardir, os.pardir,  "epoch_frontend")
#     backend_dir = os.path.join(os.pardir, os.pardir, "epoch_backend")
#     username = str(uuid.uuid4())
#     password = str(uuid.uuid4()) + "A1!"
#     name = str(uuid.uuid4())
#     bio = str(uuid.uuid4())

#     @classmethod
#     def setUpClass(cls):
#         print("==========================HERE=============================")
#         print(cls.frontend_dir)
#         print(cls.backend_dir)
#         terminate_processes_on_port(3000)
#         terminate_processes_on_port(8080)
#         cls.server_process = subprocess.Popen(["python3", "main.py"], cwd=cls.backend_dir)
#         cls.frontend_process = subprocess.Popen(["npm", "start"], cwd=cls.frontend_dir)
#         time.sleep(servers_wait_time)
#         options = webdriver.ChromeOptions()

#         if os.environ.get("CI") == "true":
#             options.add_argument("--no-sandbox")
#             options.add_argument("--headless")



#         try:
#             cls.driver = webdriver.Chrome(options=options)
#         except Exception as e:
#             cls.tearDownClass()
#             pytest.exit(f"Error starting webdriver: {e}")

#     @classmethod
#     def tearDownClass(cls):
#         try:
#             cls.driver.quit()
#         except Exception as e:
#             print(f"Error quitting webdriver: {e}")
#         global session_id
#         response = requests.delete("http://localhost:8080/api/delete/username/", data=json.dumps({"username": cls.username}), headers={"Content-Type": "application/json"}, cookies={"epoch_session_id": session_id})
#         os.kill(cls.frontend_process.pid, signal.SIGKILL)
#         os.kill(cls.server_process.pid, signal.SIGINT)
#         cls.frontend_process.kill()
#         time.sleep(servers_wait_time)
#         cls.server_process.kill()
#         time.sleep(servers_wait_time)
#         terminate_processes_on_port(3000)
#         terminate_processes_on_port(8080)

#     def test_0_register_user(self):
#         driver = self.driver
#         driver.get("http://localhost:3000/register")
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.find_element(By.ID, "register-button") is not None)
#         username = driver.find_element(By.NAME, "username")
#         username.send_keys(self.username)
#         password = driver.find_element(By.NAME, "password")
#         password.send_keys(self.password)
#         name = driver.find_element(By.NAME, "name")
#         name.send_keys(self.name)
#         bio = driver.find_element(By.NAME, "bio")
#         bio.send_keys(self.bio)
#         profile_pic = driver.find_element(By.ID, "profilePic")
#         profile_pic.send_keys(os.path.abspath('test.jpg'))
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.find_element(By.CSS_SELECTOR, ".profile-pic-upload img").get_attribute("src") != "default_image_src")
#         register = driver.find_element(By.ID, "register-button")
#         register.click()
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.get_cookie("epoch_session_id") is not None)
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: self.name in driver.page_source)
#         driver.delete_cookie("epoch_session_id")

#     def test_1_login(self):
#         driver = self.driver
#         driver.get("http://localhost:3000/login")
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.find_element(By.ID, "login-button") is not None)
#         username = driver.find_element(By.NAME, "username")
#         username.send_keys(self.username)
#         password = driver.find_element(By.NAME, "password")
#         password.send_keys(self.password)
#         login = driver.find_element(By.ID, "login-button")
#         login.click()
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.get_cookie("epoch_session_id") is not None)
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.find_element(By.CLASS_NAME, "home-feed") is not None)

#     def test_2_logout(self):
#         driver = self.driver
#         driver.get("http://localhost:3000/")
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.find_element(By.CLASS_NAME, "home-feed") is not None)
#         set_session_id(driver.get_cookie("epoch_session_id")["value"])
#         driver.delete_cookie("epoch_session_id")
#         driver.get("http://localhost:3000/")
#         WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: driver.find_element(By.ID, "login-button") is not None)


# if __name__ == '__main__':
#     unittest.main()


import random
import unittest
import os
import time
from pathlib import Path
import subprocess
from selenium import webdriver
import signal
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import requests
import json
import pytest
import random

TEST_PROFILE_PIC_BINARY = bytearray(open(Path(__file__).parent / 'test.jpg', 'rb').read())
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

servers_wait_time = 10
default_element_wait_timeout = 60
session_id = None

from epoch_backend.business.utils import terminate_processes_on_port


def set_session_id(value: str):
    global session_id
    session_id = value


class integration_tests(unittest.TestCase):
    server_process = None
    web_server = None
    frontend_process = None
    driver = None
    frontend_dir = os.path.join("..", "..", "epoch_frontend")
    backend_dir = os.path.join("..", "..", "epoch_backend")
    username = "WebserverTests"+str(random.randint(1000,9999)) # use this username so webservertest deletes this account. 
    password = "Newuser1!"
    name = "WebserverTests"
    bio = "some bio"

    @classmethod
    def setUpClass(cls):
        terminate_processes_on_port(3000)
        terminate_processes_on_port(8080)

        cls.server_process = subprocess.Popen(
            ["python3", "main.py"], cwd=str(cls.backend_dir)
        )

        cls.frontend_process = subprocess.Popen(
            ["npm", "start"], cwd=str(cls.frontend_dir))

        time.sleep(servers_wait_time)

        options = webdriver.ChromeOptions()
        if os.environ.get("CI") == "true":
            options.add_argument("--no-sandbox")
            options.add_argument("--headless")

        try:
            cls.driver = webdriver.Chrome(options=options)
        except Exception as e:
            cls.tearDownClass()
            pytest.exit(f"Error starting webdriver: {e}")

    @classmethod
    def tearDownClass(cls):
        try:
            cls.driver.quit()
        except Exception as e:
            print(f"Error quitting webdriver: {e}")

        global session_id
        response = requests.delete("http://localhost:8080/api/delete/username/",
                                   data=json.dumps({"username": cls.username}),
                                   headers={"Content-Type": "application/json"},
                                   cookies={"epoch_session_id": session_id})
        os.kill(cls.frontend_process.pid, signal.SIGKILL)
        os.kill(cls.server_process.pid, signal.SIGINT)
        cls.frontend_process.kill()
        time.sleep(servers_wait_time)
        cls.server_process.kill()
        time.sleep(servers_wait_time)

        terminate_processes_on_port(3000)
        terminate_processes_on_port(8080)

    def test_0_register_user(self):
        driver = self.driver
        driver.get("http://localhost:3000/register")
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.ID, "register-button") is not None)
        username = driver.find_element(By.NAME, "username")
        username.send_keys(self.username)
        password = driver.find_element(By.NAME, "password")
        password.send_keys(self.password)
        name = driver.find_element(By.NAME, "name")
        name.send_keys(self.name)
        bio = driver.find_element(By.NAME, "bio")
        bio.send_keys(self.bio)
        profile_pic = driver.find_element(By.ID, "profilePic")
        profile_pic.send_keys(os.path.abspath('test.jpg'))
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.CSS_SELECTOR, ".profile-pic-upload img").get_attribute(
                "src") != "default_image_src")
        register = driver.find_element(By.ID, "register-button")
        register.click()
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.get_cookie("epoch_session_id") is not None)
        driver.get("http://localhost:3000/profile")
        WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: self.name in driver.page_source)
        driver.delete_cookie("epoch_session_id")

    def test_1_login(self):
        driver = self.driver
        driver.get("http://localhost:3000/login")
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.ID, "login-button") is not None)
        username = driver.find_element(By.NAME, "username")
        username.send_keys(self.username)
        password = driver.find_element(By.NAME, "password")
        password.send_keys(self.password)
        login = driver.find_element(By.ID, "login-button")
        login.click()
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.get_cookie("epoch_session_id") is not None)
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.CLASS_NAME, "home-feed") is not None)


    def test_2_logout(self):
        driver = self.driver
        driver.get("http://localhost:3000/")
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.CLASS_NAME, "home-feed") is not None)
        set_session_id(driver.get_cookie("epoch_session_id")["value"])
        driver.delete_cookie("epoch_session_id")

    def test_3_delete_account(self):
        driver = self.driver
        driver.get("http://localhost:3000/login")
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.ID, "login-button") is not None)
        username = driver.find_element(By.NAME, "username")
        username.send_keys(self.username)
        password = driver.find_element(By.NAME, "password")
        password.send_keys(self.password)
        login = driver.find_element(By.ID, "login-button")
        login.click()
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.get_cookie("epoch_session_id") is not None)
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.CLASS_NAME, "home-feed") is not None)
        driver.get("http://localhost:3000/profile")
        WebDriverWait(driver, default_element_wait_timeout).until(lambda driver: self.name in driver.page_source)
        delete = driver.find_element(By.CLASS_NAME, "profile-delete-account-button")
        delete.click()
        WebDriverWait(driver, default_element_wait_timeout).until(
            lambda driver: driver.find_element(By.CLASS_NAME, "delete-account-button-yes") is not None)
        yes = driver.find_element(By.CLASS_NAME, "delete-account-button-yes")
        yes.click()

if __name__ == "__main__":
    unittest.main()

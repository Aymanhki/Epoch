import unittest
import pytest
from epoch_backend.business.api_endpoints.following_endpoints import follow_user, get_account_list, get_following_list, unfollow_user

class MockUserPersistence():
    def get_all_users(self, user_id):
        if user_id == 1:
            return "some data"
        elif user_id == 24:
            raise Exception("invalid user id")
        else:
            raise Exception("invalid session id")
            
    def get_following(self, user_id):
        if user_id == 1:
            return "some data"
        elif user_id == 24:
            raise Exception("invalid user id")
        else:
            raise Exception("invalid session id")

    def follow_user(self, user_id, follow_id):
        if user_id == 1 and follow_id == 2 :
            return 1
        elif user_id == -1 or follow_id == "invalid_follow_id":
            raise Exception("Invalid session or userids")
        elif user_id == 1 and follow_id == 1: # repeated attempt
            raise Exception("error adding -> dupe")

    def unfollow_user(self, user_id, follow_id):
        if user_id == 1 and follow_id == "valid_unfollow_id" :
            return 1
        elif user_id == -1 or follow_id == "invalid_unfollow_id":
            raise Exception("Invalid session or userids")
        elif user_id == 1 and follow_id == 1: # repeated unfollow
            raise Exception("error adding -> dupe")

class MockSessionPersistence():
    def get_user_by_session_id(self, session_id):
        if session_id == "valid_id":
            return "1"
        elif session_id == "invalid_id":
            return "24"
        else: # test if user id returned is not correct type
            return None

class following_unit_tests(unittest.TestCase):
    def test_0_account_list_valid_id(self):
        response = get_account_list("valid_id", MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 200
        assert response[2] != None
    def test_1_account_list_invalid_id(self):
        response = get_account_list("invalid_id", MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 500
        assert response[1] == "Could not retrieve user list"
        assert response[2] != None
    def test_2_account_list_invalid_data(self):
        response = get_account_list("something_wrong", MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 500
        assert response[1] == "No valid session"
        assert response[2] != None

    def test_3_following_list_valid_id(self):
        response = get_following_list("valid_id", MockSessionPersistence(), MockUserPersistence(), "self")
        print(response)
        assert response[0] == 200
        assert response[2] != None
    def test_4_following_list_invalid_id(self):
        response = get_following_list("invalid_id", MockSessionPersistence(), MockUserPersistence(), "self")
        print(response)
        assert response[0] == 500
        assert response[1] == "Could not retrieve following list"
        assert response[2] != None
    def test_5_following_list_invalid_data(self):
        response = get_following_list("something_wrong", MockSessionPersistence(), MockUserPersistence(), "self")
        print(response)
        assert response[0] == 500
        assert response[1] == "No valid session"
        assert response[2] != None


    def test_6_follow_valid_id(self):
        response = follow_user("valid_id", 2, MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 200
    def test_7_follow_invalid_id(self):
        response = follow_user("something_wrong", "invalid_follow_id", MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 500
        assert response[1] == "Could not follow user: no valid session"
    def test_8_follow_db_error(self):
        response = follow_user("valid_id", 1, MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 500
        assert response[1] == "Could not follow user: error following"


    def test_9_unfollow_valid_id(self):
        response = unfollow_user("valid_id", 2, MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 200
    def test_10_unfollow_invalid_id(self):
        response = unfollow_user("something_wrong", "invalid_unfollow_id", MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 500
        assert response[1] == "Could not unfollow user: No valid session"
    def test_11_unfollow_db_error(self):
        response = unfollow_user("valid_id", 1, MockSessionPersistence(), MockUserPersistence())
        print(response)
        assert response[0] == 500
        assert response[1] == "Could not unfollow user: error unfollowing"


if __name__ == '__main__':
    unittest.main()

# to run locally
# python -m pytest ./epoch_backend/tests/following_unit_tests.py
# in dir ./Epoch
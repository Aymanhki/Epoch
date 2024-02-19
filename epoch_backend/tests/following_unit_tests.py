import unittest

from epoch_backend.business.api_endpoints.following_endpoints import get_account_list, get_following_list, follow_user, unfollow_user


class MockSessionPersistence():
    def get_user_by_session_id(session_id):
        if (session_id == "validID"):
            return "1"
        elif(session_id == "invalidID"):
            return "-1"
        else:
            raise Exception("not a valid session") 

class MockUserPersistence():
    def get_all_users(user_id):
        if (user_id == 1):
            return "some json obj"
        elif(user_id == -1):
            raise Exception("invalid id")
        else:
            raise Exception("get all user error")   
            
    def get_following(user_id):
        if (user_id == "validUser"):
            return "some json obj"
        else:
            raise Exception("invalid id")     
    def follow_user(user_id, following_id):
        if (user_id == "validUser" and following_id == "validFollowID"):
            return user_id
        elif (user_id == "repeatedUser" and following_id == "repeatedFollowID"):
            raise Exception("repeated follow")
        else:
            raise Exception("invalid follow")  
    def unfollow_user(user_id, following_id):
        if (user_id == "validUser" and following_id == "validUnfollowID"):
            return user_id
        elif (user_id == "repeatedUser" and following_id == "repeatedUnfollowID"):
            raise Exception("repeated unfollow")
        else:
            raise Exception("invalid unfollow")

class following_unit_tests(unittest.TestCase):
    def test_0_get_acc_list_valid_id(self):
        result = get_account_list("validID", MockSessionPersistence(), MockUserPersistence())
        assert ( result[0] == 200 and result[1] == "OK" )
    def test_1_get_acc_list_invalid_session(self):
        result = get_account_list("invalidID", MockSessionPersistence(), MockUserPersistence())
        assert ( result[0] == 500 and result[1] == "Could not retrieve user list" )
    def test_2_get_acc_list(self):
        result = get_account_list("nonValidData", MockSessionPersistence(), MockUserPersistence())
        assert ( result[0] == 500 and result[1] == "No valid session" )

    def test_3_get_fol_list_valid_id(self):
        result = get_following_list("validID", MockSessionPersistence(), MockUserPersistence())
        assert ( result[0] == 200 and result[1] == "OK" )
    def test_4_get_fol_list_invalid_session(self):
        result = get_following_list("invalidID", MockSessionPersistence(), MockUserPersistence())
        assert ( result[0] == 500 and result[1] == "Could not retrieve following list" )
    def test_5_get_fol_list(self):
        result = get_following_list("nonValidSession", MockSessionPersistence(), MockUserPersistence())
        assert ( result[0] == 500 and result[1] == "No valid session" )

    def test_6_fol_list_valid_id(self):
        result = follow_user("validID", "validFollowID", MockSessionPersistence(), MockUserPersistence())
        assert (result[0] == 200, result[1] == "OK")
    def test_7_fol_list_invalid_session(self):
        result = follow_user("noneValidSession", "validFollowID", MockSessionPersistence(), MockUserPersistence())
        assert (result[0] == 500, result[1] == "Could not follow user: no valid session")
    def test_8_fol_dupe(self):
        result = follow_user("repeatedUser", "repeatedFollowID", MockSessionPersistence(), MockUserPersistence())
        assert (result[0] == 500, result[1] == "Could not follow user: error following")

    def test_9_unfol_list_valid_id(self):
        result = follow_user("validID", "validUnfollowID", MockSessionPersistence(), MockUserPersistence())
        assert (result[0] == 200, result[1] == "OK")
    def test_10_unfol_list_invalid_session(self):
        result = follow_user("noneValidSession", "validUnfollowID", MockSessionPersistence(), MockUserPersistence())
        assert (result[0] == 500, result[1] == "Could not follow user: no valid session")
    def test_11_unfol_dupe(self):
        result = follow_user("repeatedUser", "repeatedFollowID", MockSessionPersistence(), MockUserPersistence())
        assert (result[0] == 500, result[1] == "Could not unfollow user: error unfollowing")

    @classmethod
    def tearDownClass(cls):
        pass
    
if __name__ == '__main__':
    unittest.main()
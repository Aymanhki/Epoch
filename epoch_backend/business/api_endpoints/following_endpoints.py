import json

def get_account_list(session_id, session_persistence, user_persistence):
    try:
        user_id_l = session_persistence.get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0] #convert what is returned to an int
    except:
        return ([500, "No valid session", b"<h1>500 Internal Server Error</h1>"])
    try:
        accountList = user_persistence.get_all_users(user_id)
        return ([200, "OK", accountList.encode('UTF-8')])
    except:
        return ([500, "Could not retrieve user list", b"<h1>500 Internal Server Error</h1>"])


def get_following_list(session_id, session_persistence, user_persistence, target):
    try:
        user_id_l = session_persistence.get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0] #convert what is returned to an int
    except:
        return ([500, "No valid session", b"<h1>500 Internal Server Error</h1>"])
    
    if target != "self":
        user_id = int(target)

    try:
        followingList = user_persistence.get_following(user_id)
        return ([200, "OK", followingList.encode('UTF-8')])
    except:
        return ([500, "Could not retrieve following list", b"<h1>500 Internal Server Error</h1>"])
    
def get_follower_list(session_id, session_persistence, user_persistence, target):
    try:
        user_id_l = session_persistence.get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0] #convert what is returned to an int
    except:
        return ([500, "No valid session", b"<h1>500 Internal Server Error</h1>"])
    
    if target != "self":
        user_id = int(target)

    try:
        followerList = user_persistence.get_followers(user_id)
        return ([200, "OK", followerList.encode('UTF-8')])
    except:
        return ([500, "Could not retrieve following list", b"<h1>500 Internal Server Error</h1>"])


def follow_user(session_id, toFollow, session_persistence, user_persistence):
    try:
        user_id_l = session_persistence.get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0]
    except:
        return ([500, "Could not follow user: no valid session", b"<h1>500 Internal Server Error</h1>"])

    if user_id is not None and toFollow is not None:
        try:
            user_persistence.follow_user(user_id, toFollow)
            return([200, "OK", json.dumps({"user_id": user_id}).encode('UTF-8')])
        except:
            return ([500, "Could not follow user: error following", b"<h1>500 Internal Server Error</h1>"])
    else:
        return ([500, "Could not follow user: invalid id", b"<h1>500 Internal Server Error</h1>"])


def unfollow_user(session_id, toUnfollow, session_persistence, user_persistence):
    try:
        user_id_l = session_persistence.get_user_by_session_id(session_id)
        user_id = [int(l[0]) for l in user_id_l][0]
    except:
        return ([500, "Could not unfollow user: No valid session", b"<h1>500 Internal Server Error</h1>"])

    if user_id is not None and toUnfollow is not None:
        try:
            user_persistence.unfollow_user(user_id, toUnfollow)
            return ([200, "OK", json.dumps({"user_id": user_id}).encode('UTF-8')])
        except:
            return ([500, "Could not unfollow user: error unfollowing", b"<h1>500 Internal Server Error</h1>"])
    else:
        return ([500, "Could not unfollow user: invalid id", b"<h1>500 Internal Server Error</h1>"])
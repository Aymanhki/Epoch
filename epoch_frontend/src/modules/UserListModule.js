import {followAccount, unfollowAccount} from "../services/following";
import {useNavigate} from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";


export default function UserListModule ({ userList }) {
    const navigate = useNavigate();

    const handleFollow = (target, isFollowing) => {
        var targetIndex;
        for (var i in userList) {
            if (userList[i].user_id === target) {
                userList[i].isFollowing = 2;
                targetIndex = i;
            }
        }

        if (isFollowing === 1) {
            unfollowAccount(target)
                .then(data =>{
                    userList[targetIndex].isFollowing = 0;
                })
                .catch(error => {
                    console.log("Error unfollowing user:", error);
                })
        } else if (isFollowing === 0){
            followAccount(target)
                .then(data =>{ 
                    userList[targetIndex].isFollowing = 1;
                })
                .catch(error => {
                    console.log("Error following user:", error);
                })
        }
    }

    const getFollowingPrompt = (isFollowing) => {
        if (isFollowing === 0) {
            return "Follow";

        }
        else if (isFollowing === 1) {
            return "Unfollow";
        }
        else {
            return "Please Wait...";
        }
    }

    return (
        userList && userList.map && userList.map(account =>
            <li key={account.user_id} className={"user-list-items-container"}>

            <div className="user-list-item">
                <div className="user-list-item-profile-icon-container">
                    <AccountCircleOutlinedIcon/>
                </div>

                <div className="user-list-item-username-container">
                    <b className="username"
                    onClick={() => navigate('/epoch/' + account.username)}>@{account.username} </b>
                </div>

                <div className="user-list-item-following-status-container">
                    {account.isFollowing ?
                        <b className="following-status"> (following)</b> :
                        <b> </b>}
                </div>

                <div className="user-list-item-follow-button-container">
                    <button type="button" className="search-follow-button"
                    onClick={() => { handleFollow(account.user_id, account.isFollowing) }}
                    disabled = {account.isFollowing>1}
                    >{getFollowingPrompt(account.isFollowing)}</button>
                </div>
            </div>
        </li>
        )
    )

}
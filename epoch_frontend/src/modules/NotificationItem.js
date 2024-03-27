import ArrowCircleUpSharpIcon from '@mui/icons-material/ArrowCircleUpSharp';
import ArrowCircleDownSharpIcon from '@mui/icons-material/ArrowCircleDownSharp';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PersonRemoveAlt1OutlinedIcon from '@mui/icons-material/PersonRemoveAlt1Outlined';
import ConnectWithoutContactOutlinedIcon from '@mui/icons-material/ConnectWithoutContactOutlined';
import React from "react";
import {useNavigate} from "react-router-dom";
import {useEffect, useState, useRef} from "react";
import '../styles/NotificationItem.css';
import {markNotificationRead} from "../services/notification";
import {useContext} from "react";
import {UserContext} from "../services/UserContext";

function NotificationItem({notification, setShowNotifications, onRead}) {
    const navigate = useNavigate();
    const [notificationIcon, setNotificationIcon] = useState(null);
    const [notificationText, setNotificationText] = useState('');
    const [notificationRead, setNotificationRead] = useState(notification.read);
    const markReadRef = useRef(null);
    const [notificationActionLink, setNotificationActionLink] = useState('');
    const {user} = useContext(UserContext);
    const {updateUser} = useContext(UserContext);

    useEffect(() => {
        if (notification.type === 'up-vote') {
            setNotificationIcon(<ArrowCircleUpSharpIcon className={"notification-up-vote-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') up voted your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'down-vote') {
            setNotificationIcon(<ArrowCircleDownSharpIcon className={"notification-down-vote-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +')  down voted your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'delete-up-vote') {
            setNotificationIcon(<ArrowCircleUpSharpIcon className={"notification-delete-up-vote-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') removed their up vote from your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id)
        } else if (notification.type === 'delete-down-vote') {
            setNotificationIcon(<ArrowCircleDownSharpIcon className={"notification-delete-down-vote-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') removed their down vote from your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'new-comment') {
            setNotificationIcon(<ForumOutlinedIcon className={"notification-new-comment-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') made a comment on your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'delete-comment') {
            setNotificationIcon(<ForumOutlinedIcon className={"notification-delete-comment-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') deleted their comment on your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'favorite') {
            setNotificationIcon(<FavoriteBorderOutlinedIcon className={"notification-favorite-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') liked your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'delete-favorite') {
            setNotificationIcon(<FavoriteBorderOutlinedIcon className={"notification-delete-favorite-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') unliked your post');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        } else if (notification.type === 'new-follower') {
            setNotificationIcon(<PersonAddAlt1OutlinedIcon className={"notification-follow-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') has started following you');
            setNotificationActionLink('/' + notification.target_username);
        } else if (notification.type === 'lost-follower') {
            setNotificationIcon(<PersonRemoveAlt1OutlinedIcon className={"notification-unfollow-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') has unfollowed you');
            setNotificationActionLink('/' + notification.target_username);
        } else if (notification.type === 'mention') {
            setNotificationIcon(<ConnectWithoutContactOutlinedIcon className={"notification-mention-icon"}/>);
            setNotificationText(notification.target_name + ' (@'+ notification.target_username +') has dedicated a post to you');
            setNotificationActionLink('/epoch/comments/' + notification.target_id);
        }
    }, [notification]);




    return (
        <div className={`notification-item-container ${notificationRead ? 'notification-read' : 'notification-unread'}`} onClick={() => {
            navigate(notificationActionLink);
            setNotificationRead(true);
            onRead(notification.notif_id);
        }}>
            <div className={'notification-item'} >
                <div className={"notification-icon"}>
                    {notificationIcon}
                </div>

                <div className={"notification-text-container"}>
                    <p className={"notification-text-text"}>{notificationText}</p>
                </div>

                <div className={"notification-profile-pic-wrapper"}>
                    <div className={'target-profile-pic-container'}>
                        <img src={notification.target_profile_pic} alt={"Profile"} className={"target-profile-pic"}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationItem;
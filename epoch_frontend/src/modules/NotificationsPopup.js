
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState, useRef} from "react";
import '../styles/NotificationsPopup.css';
import {markAllNotificationsRead, getUserNotifications, markNotificationRead} from "../services/notification";
import NotificationItem from "./NotificationItem";
import {Spinner} from "./Spinner";
import {useSpring, animated} from "react-spring";
import {useContext} from "react";
import {UserContext} from "../services/UserContext";

function NotificationsPopup ({showNotifications, setShowNotifications, newUnreadNotifications, setNewUnreadNotifications, userId})
{
    const {updateUser} = useContext(UserContext);
    const {user} = useContext(UserContext);
    const[notifications, setNotifications] = useState((user && user.notifications) || []);
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [noMoreNotifications, setNoMoreNotifications] = useState(false);
    const [countUnreadNotifications, setCountUnreadNotifications] = useState(0);
    const [loadMorePrompt, setLoadMorePrompt] = useState('Load more');
    const [markAllAsReadPrompt, setMarkAllAsReadPrompt] = useState('Mark all as read');

    const {transform: inTransform, opacity: inOpacity} = useSpring({
        opacity: showNotifications ? 1 : 0,
        transform: `translateY(${showNotifications ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransform, opacity: outOpacity} = useSpring({
        opacity: showNotifications ? 1 : 0,
        transform: `translateY(${showNotifications ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    const handleClosing = () => {
        setShowNotifications(false);
    }

    const getNotifications = () => {
        setIsLoading(true);
        let offsetToUse = offset;

        if (noMoreNotifications) {
            offsetToUse = 0;
        }
        else
        {
            offsetToUse = offset;
        }

        getUserNotifications(userId, limit, offsetToUse)
            .then(data => {
                let newData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                let mergedData = newData.concat(notifications);

                // Filter out read notifications from the merged data
                let unreadData = mergedData.filter(notification => !notification.read);

                // Filter out duplicates while keeping the latest ones
                let seen = new Set();
                let uniqueData = [];
                for (let i = 0; i < unreadData.length; i++) {
                    const notification = unreadData[i];
                    const key = JSON.stringify(notification);
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueData.push(notification);
                    }
                }

                // If there are more than 50 unread notifications, keep only the latest 50
                let finalData = uniqueData.slice(0, 50);

                setNotifications(finalData);
                setIsLoading(false);

                if (data.length < limit || data.length === 0) {
                    setNoMoreNotifications(true);
                    setOffset(0);
                }


                setOffset(offset + limit);

                user.notifications = notifications;
                user.noMoreNotifications = noMoreNotifications;
                updateUser(user);

                for (let i = 0; i < data.length; i++) {
                    if(data[i].read == false) {
                        setNewUnreadNotifications(true);
                        break;
                    }
                }
            })
            .catch(error => {
                console.log(error);
                setIsLoading(false);
            });
    }

    useEffect(() => {
        if (!showNotifications && !isLoading ) {
            const interval = setInterval(() => {
                getNotifications();
            }, 90000000);

            return () => clearInterval(interval);
        }

    }, [showNotifications, isLoading]);

    useEffect(() => {
        if (notifications.length === 0 && noMoreNotifications !== true) {
            getNotifications();
        }
    }, []);

    useEffect(() => {
        let count = 0;
        for (let i = 0; i < notifications.length; i++) {
            if(notifications[i].read == false) {
                count++;
            }
        }

        setCountUnreadNotifications(count);

        if(count > 0) {
            setNewUnreadNotifications(true);
        }
        else
        {
            setNewUnreadNotifications(false);
        }
    }, [notifications]);

    useEffect(() => {
        if (newUnreadNotifications) {
            setMarkAllAsReadPrompt('Mark all as read');
        } else {
            setMarkAllAsReadPrompt('All notifications read');
        }

        if (noMoreNotifications) {
            setLoadMorePrompt('No more notifications');
        } else {
            setLoadMorePrompt('Load more');
        }
    }, [newUnreadNotifications, noMoreNotifications]);

    const markNotificationAsRead = (notificationId) => {
        setShowNotifications(false);
        let notification = notifications.find(notification => notification.notif_id === notificationId);
        notification.read = true;
        setNotifications([...notifications]);
        user.notifications = notifications;
        updateUser(user);

        markNotificationRead(notificationId)
            .then(() => {

            })
            .catch(error => {
                console.log(error);
            });
    }


    return (
        <animated.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: showNotifications ? inOpacity : outOpacity,
                transform: showNotifications ? inTransform : outTransform,
                zIndex: 1000
            }}
        >
            <div className={'notifications-popup-overlay'} onClick={() => handleClosing()}/>
            <div className="notifications-popup">
                {isLoading ? <Spinner className="notifications-popup-loading"></Spinner> : (
                    <>
                        <div className="notifications-popup-header">
                            <h3>Notifications (Beta)</h3>
                        </div>

                        <div className="notifications-popup-content-container">
                            {notifications.length === 0 && !isLoading && (<div className="notifications-popup-empty">You're all caught up!</div>)}
                        <div className="notifications-popup-content">
                            {notifications && notifications.map && notifications.map(notification =>
                                <NotificationItem key={notification.notif_id} notification={notification} setShowNotifications={setShowNotifications} onRead={markNotificationAsRead} />
                            )}
                        </div>
                        </div>


                        <div className="notifications-popup-footer">
                            <button onClick={() => {
                                setIsLoading(true);
                                markAllNotificationsRead(userId)
                                .then(() => {
                                    for (let i = 0; i < notifications.length; i++) {
                                        notifications[i].read = true;
                                    }
                                    setNotifications([...notifications]);
                                    user.notifications = notifications;
                                    updateUser(user);

                                    getNotifications();
                                    setNewUnreadNotifications(false);
                                    setCountUnreadNotifications(0);
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                            }}
                            disabled={countUnreadNotifications === 0} className={countUnreadNotifications === 0 ? 'disabled' : ''}>
                                {markAllAsReadPrompt}
                            </button>
                            <button onClick={() => getNotifications()} disabled={noMoreNotifications} className={noMoreNotifications ? 'disabled' : ''}>
                                {loadMorePrompt}
                            </button>

                        </div>
                    </>
                )}
            </div>


        </animated.div>
    );
}

export default NotificationsPopup;
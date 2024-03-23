import React, {useEffect, useState, useContext} from "react";
import {Spinner} from "../modules/Spinner";
import {UserContext} from "../services/UserContext";
import {getFavoritePosts} from "../services/post";
import Feed from "../modules/Feed";
import NavBar from "../modules/NavBar";
import '../styles/Favorites.css';
import PostPopup from "../modules/PostPopup";
import {getUserInfo} from "../services/user";


function Favorites() {
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const {user, updateUser} = useContext(UserContext);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [refreshFeed, setRefreshFeed] = useState(true);

    const updatePosts = React.useCallback(() => {
        if (user) {
            getFavoritePosts(user.id)
                .then(data => {
                    setPosts(data);
                    setIsLoading(false);
                    setRefreshFeed(false);
                })
                .catch(error => {
                    console.log(error);
                    setIsLoading(false);
                    setRefreshFeed(false);
                });
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            getUserInfo()
                .then((data) => {
                    updateUser(data);
                })
                .catch((error) => {
                    updateUser(null);
                });
        }
    }, [updateUser, user]);

    useEffect(() => {
        if (refreshFeed) {
            setIsLoading(true);
            updatePosts();
        }
    }, [updatePosts, refreshFeed]);

    if (!user) {
        return (
            <Spinner/>
        );
    }

    return (
        <>
            {user && <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
                             showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup} userId={user.id}/>}
            {isLoading ? (
                <Spinner/>
            ) : (
                <div className={"favorites-page-container"}>
                    <div className={"favorites-feed-wrapper"}>
                        <div className={"favorites-feed"}>
                            {user ? (<Feed feedUsername={user.username} feedUserId={user.id} isInProfile={true}
                                           currentUser={user} showNewPostPopup={showNewPostPopup}
                                           setShowNewPostPopup={setShowNewPostPopup} refreshFeed={refreshFeed}
                                           setRefreshFeed={setRefreshFeed} posts={posts}
                                           isInFavorites={true}/>) : (<></>)}
                        </div>
                    </div>
                    {user ? (<PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                        username={user.username} profilePic={user.profile_pic_data}
                                        refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>) : (<></>)}
                </div>
            )}
        </>
    );
}

export default Favorites;
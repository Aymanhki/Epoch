import React, {useState, useEffect} from 'react';
import '../styles/Feed.css';
import {Spinner} from "./Spinner";
import PostPopup from "./PostPopup";
import Post from "./Post";
import {getAllUserPosts} from '../services/post.js'



export default function Feed({feedUsername, feedUserId, isInProfile, currentUser, showNewPostPopup, setShowNewPostPopup, refreshFeed, setRefreshFeed}) {
    const [isLoading, setIsLoading] = useState(true);
    const [feedPosts, setFeedPosts] = useState(Array(10).fill(null));

    const fetchImage = async () => {
        const response = await fetch(process.env.PUBLIC_URL + '/images/placeholder.png');
        const blob = await response.blob();
        return blob;
    };

    const createTempPost = async () => {
        const imageBlob = Math.random() < 0.5 ? await fetchImage() : null;

        return {
            post_id: Math.floor(Math.random() * 100000),
            profile_picture_type: currentUser.profile_pic_type,
            profile_picture_name: currentUser.profile_pic_name,
            username: currentUser.username,
            profile_picture: currentUser.profile_pic_data,
            release: new Date().toDateString(),
            caption: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusamus alias aliquam at aut consectetur consequatur corporis, cum doloremque dolorum eos est ex explicabo facere hic id, in iure laboriosam laborum libero, magni necessitatibus nemo obcaecati quae quas quasi quidem quo quos recusandae rem sequi ullam ut vel veritatis vero voluptate voluptatem. Accusamus adipisci aperiam atque aut consectetur corporis, cum delectus eaque earum eius eligendi est eum explicabo facilis illo inventore iste iure mollitia necessitatibus nemo non quas quisquam repellendus saepe sint sit ut velit vero vitae, voluptatum. Aliquid ea id magnam odit quis veritatis voluptatibus. Corporis culpa dolore est facere facilis ipsam mollitia qui soluta unde. Ad adipisci aperiam beatae corporis dolor dolores earum eligendi et, ex exercitationem, illo, illum in ipsam laborum maiores mollitia nobis omnis perspiciatis quia quis reprehenderit repudiandae sapiente sequi sunt ullam ut veritatis vero. Illo natus quas reiciendis repellat! Aut cupiditate odit optio possimus sit! Alias debitis ea earum excepturi explicabo facilis praesentium provident quam quibusdam? Debitis distinctio eaque, eos eum exercitationem facere incidunt ipsa, iusto labore laudantium magnam necessitatibus nobis obcaecati officiis repellat soluta sunt vel voluptas. Atque autem distinctio eaque esse, ex fugiat harum, hic perspiciatis, quia quibusdam sed sequi sint voluptate!',
            file: imageBlob
        };
    };

    const populateTempPosts = async () => {
        const postPromises = Array(5).fill(null).map(async (_, index) => {
            const post = await createTempPost();
            return post;
        });

        const resolvedPosts = await Promise.all(postPromises);
        setFeedPosts(resolvedPosts);
    };

    useEffect(() => {
        refreshFeedPosts();
    }, [ feedUserId, feedUsername, currentUser, isInProfile]);

    useEffect( () => {
        if (refreshFeed) {
            setIsLoading(true);
            refreshFeedPosts();
        }
    }, [refreshFeed]);

    const refreshFeedPosts = () => {

        if(isInProfile && feedUserId && currentUser.id === feedUserId)
        {
            getAllUserPosts(currentUser.id).then((data) => {
                setFeedPosts(data);
                setIsLoading(false);
            }).catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
        }
        else if(feedUserId && currentUser.id !== feedUserId)
        {
            getAllUserPosts(feedUserId).then((data) => {
                setFeedPosts(data);
                setIsLoading(false);
            }).catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
        }
        else if(!isInProfile && feedUsername && currentUser.username === feedUsername)
        {
            // ideally, here we would fetch the posts from the users that the current user is following (shuffle or show chronological order)
            populateTempPosts().then(() => {
                setIsLoading(false);
            });
        }

        setRefreshFeed(false);
    }

    return (
        <>
        {isLoading ? (<Spinner/>) :
            (
                <div className={'feed-wrapper'}>

                <div className={'posts-wrapper'}>
                    {feedPosts.map((newPost, index) => <Post key={ newPost.post_id} post={newPost}/>)}
                </div>
                {( (!isInProfile &&feedUsername && currentUser.username === feedUsername) || (isInProfile && feedUserId && currentUser.id === feedUserId) ) && (<button className={`new-post-button ${showNewPostPopup ? 'rotate' : ''}`}
                        onClick={() => setShowNewPostPopup(!showNewPostPopup)}>+</button>)}

            </div>)}
        </>
    )
}

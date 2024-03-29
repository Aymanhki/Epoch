function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function newPost(postObject) {
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('POST', `${serverUrl}/api/post/`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${session_id}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };


        if (postObject.file) {
            const reader = new FileReader();

            reader.onload = function () {
                postObject.file = reader.result.split(',')[1];
                xhr.send(JSON.stringify(postObject));
            }

            reader.readAsDataURL(postObject.file);
            return;
        }

        xhr.send(JSON.stringify(postObject));
    });
}

function getAllUserPosts(userId, offset, limit) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/user/posts/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Offset', offset);
        xhr.setRequestHeader('Limit', limit);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });
}

function getAllHashtagPosts(hashtag, offset, limit) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/post/hashtag/`, true);
        xhr.setRequestHeader('Hashtag', hashtag);
        xhr.setRequestHeader('Offset', offset);
        xhr.setRequestHeader('Limit', limit);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });
}

function deletePost(postId, userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('DELETE', `${serverUrl}/api/user/posts/`, true);
        xhr.setRequestHeader('Post-Id', postId);
        xhr.setRequestHeader('User-Id', userId);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });
}

function updatePost(newPostObject, userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('PUT', `${serverUrl}/api/user/posts/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        if (newPostObject.file) {
            const reader = new FileReader();

            reader.onload = function () {
                newPostObject.file = reader.result.split(',')[1];
                xhr.send(JSON.stringify(newPostObject));
            }

            reader.readAsDataURL(newPostObject.file);
            return;
        }

        xhr.send(JSON.stringify(newPostObject));
    });
}

function getFollowedUsersPost(userId, offset, limit) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/followed/posts/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Offset', offset);
        xhr.setRequestHeader('Limit', limit);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });

}

function favoritePost(postId, userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('POST', `${serverUrl}/api/favorite/posts/`, true);
        xhr.setRequestHeader('Post-Id', postId);
        xhr.setRequestHeader('User-Id', userId);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });
}

function removeFavoritePost(postId, userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('DELETE', `${serverUrl}/api/favorite/posts/`, true);
        xhr.setRequestHeader('Post-Id', postId);
        xhr.setRequestHeader('User-Id', userId);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });
}

function getFavoritePosts(userId, offset, limit) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/favorite/posts/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Offset', offset);
        xhr.setRequestHeader('Limit', limit);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.send();
    });

}

function votePost(postId, userId, vote) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;

        xhr.open('POST', `${serverUrl}/api/vote/post/`, true);
        xhr.setRequestHeader('Post-Id', postId);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Vote', vote);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };
        xhr.send(JSON.stringify({ vote: vote }));
    });

}

function removeVotePost(postId, userId, vote) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;

        xhr.open('DELETE', `${serverUrl}/api/vote/post/`, true);
        xhr.setRequestHeader('Post-Id', postId);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Vote', vote);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };
        xhr.send( JSON.stringify({ vote: vote }));
    });
}

module.exports = {
    newPost,
    getAllUserPosts,
    getAllHashtagPosts,
    deletePost,
    updatePost,
    getFollowedUsersPost,
    favoritePost,
    removeFavoritePost,
    getFavoritePosts,
    votePost,
    removeVotePost
};
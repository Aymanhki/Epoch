import React from 'react';
import AudioPlayer from 'react-audio-player';
import '../styles/PostPopup.css';

const SmartMedia = ({src, type, className, ...otherProps}) => {
    // Function to determine the media type based on the file type
    const getMediaType = () => {
        if (type.startsWith('image/')) {
            return 'image';
        } else if (type.startsWith('video/')) {
            return 'video';
        } else if (type.startsWith('audio/')) {
            return 'audio';
        } else {
            return 'unsupported';
        }
    };

    const renderMediaElement = () => {
        const mediaType = getMediaType();

        switch (mediaType) {
            case 'image':
                return <img src={src} alt="Media" className={'media-preview'} {...otherProps} />;
            case 'video':
                return <video src={src} controls className={'media-preview'} {...otherProps} />;
            case 'audio':
                return <video src={src} controls className={'media-preview'} {...otherProps} />;
            default:
                return <p>Unsupported media type</p>;
        }
    };

    return <div>{renderMediaElement()}</div>;
};

export default SmartMedia;

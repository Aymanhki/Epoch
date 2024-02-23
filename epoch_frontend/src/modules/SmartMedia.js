import React from 'react';
import '../styles/PostPopup.css';

const SmartMedia = ({file, base64, file_type, file_name}) => {
    const getMediaType = () => {
        if(file && file.type !== undefined && file.type !== null) {
            if (file.type.startsWith('image/')) {
                return 'image';
            } else if (file.type.startsWith('video/')) {
                return 'video';
            } else if (file.type.startsWith('audio/')) {
                return 'audio';
            } else {
                return 'unsupported';
            }
        } else if (base64) {
            if (file_type.startsWith('image/')) {
                return 'image';
            } else if (file_type.startsWith('video/')) {
                return 'video';
            } else if (file_type.startsWith('audio/')) {
                return 'audio';
            } else {
                return 'unsupported';
            }
        }
    };

    const renderMediaElement = () => {
        const mediaType = getMediaType();

        if(file && file.type !== undefined && file.type !== null) {
            switch (mediaType) {
                case 'image':
                    return <img src={URL.createObjectURL(file)} className={'media-preview'}/>;
                case 'video':
                    return <video src={URL.createObjectURL(file)} controls className={'media-preview'}/>;
                case 'audio':
                    return <video src={URL.createObjectURL(file)} controls className={'media-preview'}/>;
                default:
                    return <p>Unsupported media type</p>;
            }
        } else if (base64) {
            switch (mediaType) {
                case 'image':
                    return <img src={base64} className={'media-preview'}/>;
                case 'video':
                    return <video src={base64} controls className={'media-preview'}/>;
                case 'audio':
                    return <video src={base64} controls className={'media-preview'}/>;
                default:
                    return <p>Unsupported media type</p>;
            }
        }
    };

    return <div>{renderMediaElement()}</div>;
};

export default SmartMedia;

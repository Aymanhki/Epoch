import React from 'react';
import '../styles/PostPopup.css';

const SmartMedia = ({file, fileUrl, file_type, file_name}) => {
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
        } else if (fileUrl && file_type !== undefined && file_type !== null) {
            if (file_type.startsWith('image/')) {
                return 'image';
            } else if (file_type.startsWith('video/')) {
                return 'video';
            } else if (file_type.startsWith('audio/')) {
                return 'audio';
            } else {
                return 'unsupported';
            }
        } else {
            return 'unsupported';
        }
    };

    const renderMediaElement = () => {
        const mediaType = getMediaType();

        if(file && file.type !== undefined && file.type !== null) {
            switch (mediaType) {
                case 'image':
                    return <img src={URL.createObjectURL(file)} className={'media-preview'}/>;
                case 'video':
                    return <video src={URL.createObjectURL(file)} typeof={file.type} controls className={'media-preview'}/>;
                case 'audio':
                    return <video src={URL.createObjectURL(file)} controls className={'media-preview'}/>;
                default:
                    return <p>Unsupported media type</p>;
            }
        } else if (fileUrl) {
            switch (mediaType) {
                case 'image':
                    return <img src={fileUrl} className={'media-preview'}/>;
                case 'video':
                    return <video src={fileUrl} controls type={file_type} className={'media-preview'} />
                case 'audio':
                    return <video src={fileUrl} controls className={'media-preview'}/>;
                default:
                    return <p>Unsupported media type</p>;
            }
        }
    };

    return <div>{renderMediaElement()}</div>;
};

export default SmartMedia;

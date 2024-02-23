import React, {useEffect} from 'react';
import { useState   } from "react";
import SmartMedia from "./SmartMedia";
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import '../styles/Post.css';

export default function ({post}) {
    const [editable, setEditable] = useState(true);
    const [editing, setEditing] = useState(false);

    const handleSave = () => {
        // Save the post logic here

        setEditable(true);
        setEditing(false);
    }

    useEffect(() => {

    }, []);

    return (
        <div className="post">

            <div className="post-header">

                <div className="post-header-left">
                    <div className={'profile-photo-container'}>
                        <SmartMedia fileUrl={post.profile_picture} file_type={post.profile_picture_type} file_name={post.profile_picture_name} alt="Profile" className="profile-photo" />
                    </div>
                    <div className="post-header-info">
                        <h3 className={'post-username'}>{post.username}</h3>
                        <p className={'post-date'}>{post.release}</p>
                    </div>
                </div>

                <div className="post-header-right">
                    {editable && (<BorderColorOutlinedIcon className="edit-post-button-icon" onClick={() => {setEditing(true); setEditable(false); }}></BorderColorOutlinedIcon>)}
                    {editing && (<button onClick={() => handleSave()} className={"save-button"}>Save</button>)}
                </div>
            </div>

            <div className="post-body">
                <p className={"post-caption"}>{post.caption}</p>
                {post.file && <div className={'file-wrapper'}><div className={'post-file'}><SmartMedia file={post.file} fileUrl={post.file} file_type={post.file_type} file_name={post.file_name} /></div></div>}
            </div>

            <div className="post-footer">
                <p className={"view-comments-button"}>View Comments</p>
            </div>

        </div>
    );
}
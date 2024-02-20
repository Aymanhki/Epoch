import '../styles/Post.css';
import React from 'react';
import PostPopup from './PostPopup';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';


import { IconButton, Fab } from "@mui/material";

export default function Post() {
  // To show Post pop up
  const [showPost, setShowPost] = React.useState(false)
  const onClick = () => setShowPost(true)

  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div className='post'>
      <div className="floatingPostButton">
        <Fab className='postButton' color='primary'>
          <AddIcon className='postButtonIcon' onClick = {() => setShowPost(true)}/>
        </Fab>
      </div>
      <PostPopup trigger={showPost} setTrigger={setShowPost}>
        <div className="postInputBox">
            <div className="postWrapper">
              <div className="postTop">
                <img className='postProfileImage' src='' alt='' />
                <input placeholder='What is your prediction?' className='postInput' />
              </div>
              <hr className='shareHr'/>
              <div className="postBottom">
                <div className="postOptions">
                  <div className="postOption">
                    <span className='postOptionText'>Photo or Video</span>
                    <PermMediaIcon htmlColor='tomato' className='postIcon'/>
                  </div>

                  <div className="postOption">
                    {/* <span className='postOptionText'>Time</span> */}
                    <ListItemButton onClick={handleClick}>
                      <ListItemText primary="Time" />
                      <AccessTimeIcon htmlColor='green' className='postIcon' />
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <List component= "div" disablePadding>
                        <ListItemText primary="1 Hour" />
                        <ListItemText primary="1 Day" />
                        <ListItemText primary="1 Week" />
                        <ListItemText primary="1 Year" />
                        <ListItemText primary="Custom" />
                      </List> 
                    </Collapse>
                  </div>
                  <div className="postOption">
                    <span className='postOptionText'>Emoji</span>
                    <EmojiEmotionsIcon htmlColor='goldenrod' className='postIcon'/>
                  </div>
                </div>
                <button className='shareButton'>Post</button>
              </div>
            </div>
        </div>
      </PostPopup>
    </div>
  )
}


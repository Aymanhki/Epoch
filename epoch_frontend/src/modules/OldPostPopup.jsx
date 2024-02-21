import React from 'react'
import '../styles/PostPopup.css';

import CloseIcon from '@mui/icons-material/Close';

function OldPostPopup(props) {
  return (props.trigger) ? (
    <div className='postPopup'>
        <div className="popup-inner">
            <CloseIcon className='close-btn' onClick={() => props.setTrigger(false)}/>
            {props.children}
        </div>
    </div>
  ) : "";
}

export default OldPostPopup

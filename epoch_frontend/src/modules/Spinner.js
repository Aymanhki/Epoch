// Spinner.js
import React from 'react';
import '../styles/Spinner.scss';

export const Spinner = ({className}) => {

    return (
        <div className={className ? className : "container"} data-testid="loading-spinner">
            <div className="hourglass"/>
        </div>
    );
};


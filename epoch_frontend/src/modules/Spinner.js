// Spinner.js
import React from 'react';
import '../styles/Spinner.scss';
export const Spinner = () => {

  return (
      <div className="container" data-testid="loading-spinner">
          <div className="hourglass"/>
      </div>
  );
};


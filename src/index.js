import React from 'react';
import ReactDOM from 'react-dom/client';
import './services/index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Comment out StrictMode temporarily to see if it resolves the double-call issue
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
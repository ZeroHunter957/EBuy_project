import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));

const clientId =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "1064126993104-d4u7tsa73eo9v9imql46pcvo3tk6io4r.apps.googleusercontent.com";

root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={clientId}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>
);

reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@kecaknik/shared/ui';
import './admin.css';
import App from './App.jsx';
import { ToastProvider } from '@kecaknik/shared/ui';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ToastProvider><App /></ToastProvider></React.StrictMode>,
);

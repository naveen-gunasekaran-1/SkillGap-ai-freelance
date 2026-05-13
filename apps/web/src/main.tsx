import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { AuthBootstrap } from './bootstrap/AuthBootstrap';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthBootstrap />
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>,
);

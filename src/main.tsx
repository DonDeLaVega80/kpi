import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Ensure light mode is always applied
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('theme');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

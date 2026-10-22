import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import App from './App';
import './styles.css';
import './reference-theme.css';
import './print-document.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter><App /></BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);

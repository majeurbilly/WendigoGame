import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// C'est ici que votre app démarre !
// Comme le Main() en C#, c'est le point d'entrée
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

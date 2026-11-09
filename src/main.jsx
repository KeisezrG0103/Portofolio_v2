import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

export function mountObservatory(containerId = 'root') {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(containerId);
  if (!el) return;
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;

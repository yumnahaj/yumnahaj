import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.css';

const container = document.getElementById('root');
if (!container) throw new Error('لم يُعثر على عنصر الجذر #root');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

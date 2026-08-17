import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DemoAuthPage from './pages/DemoAuthPage';
import './styles/demo-auth.css';

createRoot(document.getElementById('demo-auth-root')!).render(
  <StrictMode>
    <DemoAuthPage />
  </StrictMode>
);
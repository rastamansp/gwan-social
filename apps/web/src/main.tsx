import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/contexts/AuthContext'
import { SessionUserProvider } from '@/contexts/SessionUserContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionUserProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SessionUserProvider>
  </StrictMode>,
)

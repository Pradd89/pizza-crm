import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ReservacionesProvider } from './context/ReservacionesContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReservacionesProvider>
      <App />
    </ReservacionesProvider>
  </StrictMode>,
)
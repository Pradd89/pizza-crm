import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ReservacionesProvider } from './context/ReservacionesContext'
import { ConfiguracionProvider } from './context/ConfiguracionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfiguracionProvider>
      <ReservacionesProvider>
        <App />
      </ReservacionesProvider>
    </ConfiguracionProvider>
  </StrictMode>,
)
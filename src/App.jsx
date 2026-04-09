import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Importación de tus componentes de página
import Login from './pages/login';
import Dashboard from './pages/Dashboard';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar si ya existe una sesión activa al cargar la app
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // 2. Suscribirse a cambios en la autenticación (Login, Logout, Token renovado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Pantalla de carga profesional mientras verificamos la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-600 font-medium animate-pulse">Cocinando tu acceso... 🍕</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* RUTA DE LOGIN */}
        {/* Si ya hay sesión, redirige automáticamente al Dashboard */}
        <Route 
          path="/" 
          element={!session ? <Login /> : <Navigate to="/dashboard" replace />} 
        />

        {/* RUTA DEL DASHBOARD (PROTEGIDA) */}
        {/* Si NO hay sesión, redirige al Login */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/" replace />} 
        />

        {/* MANEJO DE RUTAS NO ENCONTRADAS (404) */}
        <Route 
          path="*" 
          element={<Navigate to={session ? "/dashboard" : "/"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;


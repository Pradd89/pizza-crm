import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ReservacionesContext = createContext();

export function ReservacionesProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    reservasHoy: 0,
    cumpleanos: 0,
    mesasLibres: 0,
    pendientesWhatsApp: 0
  });
  const [reservasRecientes, setReservasRecientes] = useState([]);

  const cargarDatosDashboard = useCallback(async () => {
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data: reservasHoy } = await supabase
      .from('reservaciones')
      .select('*')
      .eq('fecha', hoy);
    
    const mesActual = new Date().getMonth() + 1;
    const { data: cumpleanosData } = await supabase
      .from('cumpleanos')
      .select('*')
      .gte('fecha', `${new Date().getFullYear()}-${mesActual}-01`)
      .lte('fecha', `${new Date().getFullYear()}-${mesActual}-31`);
    
    const { data: mesas } = await supabase
      .from('mesas')
      .select('*')
      .eq('estado', 'disponible');
    
    const { data: mensajesPendientes } = await supabase
      .from('mensajes_whatsapp')
      .select('*')
      .eq('estado', 'pendiente');
    
    const { data: proximasReservas } = await supabase
      .from('reservaciones')
      .select('*')
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })
      .limit(5);
    
    setStats({
      reservasHoy: reservasHoy?.length || 0,
      cumpleanos: cumpleanosData?.length || 0,
      mesasLibres: mesas?.length || 8,
      pendientesWhatsApp: mensajesPendientes?.length || 0
    });
    
    setReservasRecientes(proximasReservas || []);
  }, []);

  const refreshDashboard = useCallback(() => {
    cargarDatosDashboard();
    setRefreshTrigger(prev => prev + 1);
  }, [cargarDatosDashboard]);

  useState(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  return (
    <ReservacionesContext.Provider value={{ 
      refreshTrigger, 
      refreshDashboard, 
      stats, 
      reservasRecientes,
      cargarDatosDashboard 
    }}>
      {children}
    </ReservacionesContext.Provider>
  );
}

export function useReservaciones() {
  return useContext(ReservacionesContext);
}
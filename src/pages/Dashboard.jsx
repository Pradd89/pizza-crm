import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Pizza,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Reservaciones from './Reservaciones';
import { useReservaciones } from '../context/ReservacionesContext';
import Whatsapp from './Whatsapp';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { stats, reservasRecientes, refreshDashboard, cargarDatosDashboard } = useReservaciones();

  // NUEVO ESTADO: Asegura el conteo exacto de "Hoy" usando la fecha local
  const [reservasHoyConteo, setReservasHoyConteo] = useState(0);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error.message);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Reservaciones', icon: <Calendar size={20} /> },
    { name: 'Cumpleaños', icon: <Users size={20} /> },
    { name: 'WhatsApp/FB', icon: <MessageSquare size={20} /> },
    { name: 'Configuración', icon: <Settings size={20} /> },
  ];

  // Escuchar cambios en las reservaciones (Suscripción en tiempo real)
  useEffect(() => {
    const subscription = supabase
      .channel('reservaciones_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservaciones' }, 
        () => {
          refreshDashboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshDashboard]);

  // Cargar datos iniciales del contexto
  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // NUEVO EFECTO: Consulta directa a Supabase filtrando por la fecha local.
  useEffect(() => {
    const obtenerReservasDeHoy = async () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hoy = `${year}-${month}-${day}`;

      const { count, error } = await supabase
        .from('reservaciones')
        .select('*', { count: 'exact', head: true })
        .eq('fecha', hoy)
        .neq('estado', 'cancelada');

      if (!error) {
        setReservasHoyConteo(count || 0);
      }
    };

    obtenerReservasDeHoy();
  }, [stats]); 

  const statsCards = [
    { title: 'Reservas Hoy', value: reservasHoyConteo, color: '#3b82f6', bg: '#eff6ff', icon: <Calendar size={24} /> },
    { title: 'Cumpleaños', value: stats.cumpleanos || 0, color: '#9333ea', bg: '#faf5ff', icon: <Users size={24} /> },
    { title: 'Mesas Libres', value: stats.mesasLibres || 8, color: '#16a34a', bg: '#f0fdf4', icon: <Pizza size={24} /> },
    { title: 'Pendientes WhatsApp', value: stats.pendientesWhatsApp || 0, color: '#ea580c', bg: '#fff7ed', icon: <MessageSquare size={24} /> },
  ];

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'confirmada': return { bg: '#dcfce7', color: '#166534', text: 'Confirmada' };
      case 'cancelada': return { bg: '#fee2e2', color: '#991b1b', text: 'Cancelada' };
      default: return { bg: '#fef3c7', color: '#92400e', text: 'Pendiente' };
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: sidebarCollapsed ? '80px' : '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.02)'
      }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '28px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div style={{
          padding: '32px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#dc2626',
          fontWeight: 'bold',
          fontSize: sidebarCollapsed ? '0' : '24px',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #f3f4f6',
          marginBottom: '8px'
        }}>
          <Pizza size={36} />
          {!sidebarCollapsed && <span style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>PizzaCRM</span>}
        </div>

        <nav style={{
          flex: 1,
          padding: '16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === item.name ? '#fef2f2' : 'transparent',
                color: activeTab === item.name ? '#dc2626' : '#6b7280',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 0.2s',
                marginBottom: '4px'
              }}
              title={sidebarCollapsed ? item.name : ''}
              onMouseEnter={(e) => {
                if (activeTab !== item.name) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.name) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.name}</span>}
              {!sidebarCollapsed && activeTab === item.name && (
                <div style={{ marginLeft: 'auto', width: '4px', height: '4px', backgroundColor: '#dc2626', borderRadius: '50%' }} />
              )}
            </button>
          ))}
        </nav>

        <div style={{
          padding: '20px 16px',
          borderTop: '1px solid #f3f4f6',
          marginTop: 'auto'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: '#6b7280',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s'
            }}
            title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          height: '72px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111827',
            letterSpacing: '-0.5px'
          }}>{activeTab}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{
              padding: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              borderRadius: '8px',
              position: 'relative',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell size={22} />
              {stats?.pendientesWhatsApp > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              )}
            </button>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              A
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
        }}>
          {activeTab === 'Dashboard' && (
            <div style={{ padding: '32px' }}>
              {/* Tarjetas de estadísticas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginBottom: '32px',
              }}>
                {statsCards.map((stat, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '20px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: stat.bg,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      marginBottom: '16px'
                    }}>
                      {stat.icon}
                    </div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px'
                    }}>{stat.title}</p>
                    <p style={{
                      fontSize: '36px',
                      fontWeight: '800',
                      color: '#111827',
                      margin: 0
                    }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Sección de reservas recientes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 0.8fr',
                gap: '24px'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  border: '1px solid #f0f0f0',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: '#fefefe'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: '#111827',
                      margin: 0
                    }}>Próximas Reservas</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                      {new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    {!reservasRecientes || reservasRecientes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        No hay reservas próximas
                      </div>
                    ) : (
                      reservasRecientes.map((reserva, i) => {
                        const estadoStyle = getEstadoColor(reserva.estado);
                        return (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 0',
                            borderBottom: i < reservasRecientes.length - 1 ? '1px solid #f3f4f6' : 'none'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontWeight: '700',
                                  color: '#111827',
                                  fontSize: '16px'
                                }}>{reserva.cliente_nombre}</span>
                                <span style={{
                                  padding: '4px 10px',
                                  backgroundColor: estadoStyle.bg,
                                  color: estadoStyle.color,
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  borderRadius: '20px',
                                  letterSpacing: '0.3px'
                                }}>{estadoStyle.text}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' }}>
                                <span>🕒 {reserva.hora}</span>
                                <span>👥 {reserva.personas} personas</span>
                                {reserva.mesa && <span>🍽️ Mesa {reserva.mesa}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <button
                      onClick={() => setActiveTab('Reservaciones')}
                      style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      Ver todas las reservas →
                    </button>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  border: '1px solid #f0f0f0',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#dc2626'
                  }}>
                    <Calendar size={32} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    Calendario Rápido
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '20px' }}>
                    Visualización mensual de reservas y eventos especiales.
                  </p>
                  <button
                    onClick={() => setActiveTab('Reservaciones')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  >
                    Ver calendario completo →
                  </button>
                </div>
              </div>

              {/* Tarjeta de resumen */}
              <div style={{
                marginTop: '24px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9, marginBottom: '8px' }}>Resumen del día</h4>
                    <p style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
                      {reservasHoyConteo > 0 ? `${Math.min(100, Math.round((reservasHoyConteo / 15) * 100))}%` : '0%'}
                    </p>
                    <p style={{ fontSize: '13px', opacity: 0.9 }}>Ocupación esperada para hoy</p>
                  </div>
                  <div style={{ minWidth: '200px', width: '100%', maxWidth: '300px' }}>
                    <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(100, Math.round((reservasHoyConteo / 15) * 100))}%`, 
                        height: '100%', 
                        backgroundColor: 'white', 
                        borderRadius: '2px' 
                      }} />
                    </div>
                    <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px', textAlign: 'right' }}>
                      {reservasHoyConteo} de 15 reservas máximas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'Reservaciones' && <Reservaciones />}

          {/* AQUÍ ESTÁ EL MÓDULO DE WHATSAPP INTEGRADO */}
          {activeTab === 'WhatsApp/FB' && <Whatsapp />}
          
          {/* AQUÍ ESTÁ LA PANTALLA DE CONSTRUCCIÓN PARA CUMPLEAÑOS Y CONFIGURACIÓN */}
          {activeTab !== 'Dashboard' && activeTab !== 'Reservaciones' && activeTab !== 'WhatsApp/FB' && (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '2px dashed #e5e7eb',
              padding: '80px 40px',
              margin: '32px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏗️</div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                Módulo de {activeTab}
              </h2>
              <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
                Estamos trabajando duro para integrar {activeTab} en tu CRM. Próximamente disponibles todas las funcionalidades.
              </p>
              <button 
                onClick={() => setActiveTab('Dashboard')}
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
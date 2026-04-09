import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Phone, Mail, Clock, MapPin, Check, X, Trash2, Edit2, Plus } from 'lucide-react';
import { useReservaciones } from '../context/ReservacionesContext';

export default function Reservaciones() {
  const [reservaciones, setReservaciones] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshDashboard } = useReservaciones();
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '20:00',
    personas: 2,
    mesa: null,
    notas: ''
  });

  useEffect(() => {
    cargarReservaciones();
    cargarMesas();
  }, []);

  const cargarReservaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservaciones')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    
    if (error) {
      console.error('Error cargando reservaciones:', error);
    } else {
      setReservaciones(data || []);
    }
    setLoading(false);
  };

  const cargarMesas = async () => {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .order('numero');
    
    if (!error && data) {
      setMesas(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (editingId) {
      result = await supabase
        .from('reservaciones')
        .update(formData)
        .eq('id', editingId);
    } else {
      result = await supabase
        .from('reservaciones')
        .insert([formData]);
    }

    if (result.error) {
      alert('Error: ' + result.error.message);
    } else {
      alert(editingId ? 'Reservación actualizada' : 'Reservación creada');
      setShowModal(false);
      setEditingId(null);
      setFormData({
        cliente_nombre: '',
        cliente_telefono: '',
        cliente_email: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '20:00',
        personas: 2,
        mesa: null,
        notas: ''
      });
      
      // Actualizar el dashboard y la lista de reservaciones
      refreshDashboard();
      cargarReservaciones();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta reservación?')) {
      const { error } = await supabase
        .from('reservaciones')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error: ' + error.message);
      } else {
        refreshDashboard();
        cargarReservaciones();
      }
    }
  };

  const handleEdit = (reserva) => {
    setEditingId(reserva.id);
    setFormData({
      cliente_nombre: reserva.cliente_nombre,
      cliente_telefono: reserva.cliente_telefono || '',
      cliente_email: reserva.cliente_email || '',
      fecha: reserva.fecha,
      hora: reserva.hora,
      personas: reserva.personas,
      mesa: reserva.mesa,
      notas: reserva.notas || ''
    });
    setShowModal(true);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('reservaciones')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    
    if (!error) {
      refreshDashboard();
      cargarReservaciones();
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'confirmada': return { bg: '#dcfce7', color: '#166534', text: 'Confirmada' };
      case 'cancelada': return { bg: '#fee2e2', color: '#991b1b', text: 'Cancelada' };
      default: return { bg: '#fef3c7', color: '#92400e', text: 'Pendiente' };
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Reservaciones
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Gestiona todas las reservas de tu pizzería
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              cliente_nombre: '',
              cliente_telefono: '',
              cliente_email: '',
              fecha: new Date().toISOString().split('T')[0],
              hora: '20:00',
              personas: 2,
              mesa: null,
              notas: ''
            });
            setShowModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          <Plus size={20} />
          Nueva Reservación
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#dc2626',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Cargando reservaciones...</p>
        </div>
      ) : reservaciones.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: 'white',
          borderRadius: '20px',
          border: '2px dashed #e5e7eb'
        }}>
          <span style={{ fontSize: '48px' }}>📅</span>
          <h3 style={{ marginTop: '16px', color: '#374151' }}>No hay reservaciones</h3>
          <p style={{ color: '#6b7280' }}>Crea tu primera reservación</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {reservaciones.map((reserva) => {
            const estadoStyle = getEstadoColor(reserva.estado);
            return (
              <div
                key={reserva.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        {reserva.cliente_nombre}
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {estadoStyle.text}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      marginTop: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                        <Calendar size={16} /> {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                        <Clock size={16} /> {reserva.hora}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                        <Users size={16} /> {reserva.personas} personas
                      </div>
                      {reserva.mesa && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                          <MapPin size={16} /> Mesa {reserva.mesa}
                        </div>
                      )}
                      {reserva.cliente_telefono && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                          <Phone size={16} /> {reserva.cliente_telefono}
                        </div>
                      )}
                    </div>
                    {reserva.notas && (
                      <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>
                        📝 {reserva.notas}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {reserva.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                        style={{
                          padding: '8px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title="Confirmar"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    {reserva.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                        style={{
                          padding: '8px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(reserva)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(reserva.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - el mismo que tenías */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {editingId ? 'Editar Reservación' : 'Nueva Reservación'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Nombre del cliente *
                </label>
                <input
                  type="text"
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.cliente_telefono}
                    onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.cliente_email}
                    onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Personas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.personas}
                    onChange={(e) => setFormData({...formData, personas: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Mesa (opcional)
                  </label>
                  <select
                    value={formData.mesa || ''}
                    onChange={(e) => setFormData({...formData, mesa: e.target.value ? parseInt(e.target.value) : null})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Seleccionar mesa</option>
                    {mesas.map(mesa => (
                      <option key={mesa.id} value={mesa.numero}>
                        Mesa {mesa.numero} - Capacidad: {mesa.capacidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Ej: Prefiere mesa cerca de la ventana, alergias, ocasión especial..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Reservación')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
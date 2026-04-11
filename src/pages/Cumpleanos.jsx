import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfiguracion } from '../context/ConfiguracionContext';
import { 
  Cake, 
  Plus, 
  Trash2, 
  Edit2, 
  Send, 
  Calendar, 
  Phone, 
  Mail,
  Users,
  Gift,
  X,
  Check,
  Baby,
  MessageCircle,
  Star
} from 'lucide-react';

export default function Cumpleanos() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHijosModal, setShowHijosModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const { config } = useConfiguracion();
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    direccion: '',
    descuento: '10%'
  });

  const [hijoForm, setHijoForm] = useState({
    nombre: '',
    fecha_nacimiento: ''
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      // Cargar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes_cumpleanos')
        .select('*')
        .order('fecha_nacimiento', { ascending: true });
      
      if (clientesError) throw clientesError;
      
      // Cargar hijos para cada cliente
      const clientesConHijos = await Promise.all(
        (clientesData || []).map(async (cliente) => {
          const { data: hijos, error: hijosError } = await supabase
            .from('hijos_cumpleanos')
            .select('*')
            .eq('cliente_id', cliente.id);
          
          if (hijosError) console.error('Error cargando hijos:', hijosError);
          return { ...cliente, hijos: hijos || [] };
        })
      );
      
      setClientes(clientesConHijos);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar los datos: ' + error.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editingId) {
        result = await supabase
          .from('clientes_cumpleanos')
          .update({
            nombre: formData.nombre,
            telefono: formData.telefono,
            email: formData.email,
            fecha_nacimiento: formData.fecha_nacimiento,
            direccion: formData.direccion,
            descuento: formData.descuento
          })
          .eq('id', editingId);
      } else {
        result = await supabase
          .from('clientes_cumpleanos')
          .insert([{
            nombre: formData.nombre,
            telefono: formData.telefono,
            email: formData.email,
            fecha_nacimiento: formData.fecha_nacimiento,
            direccion: formData.direccion,
            descuento: formData.descuento
          }]);
      }

      if (result.error) throw result.error;
      
      alert(editingId ? 'Cliente actualizado' : 'Cliente agregado');
      setShowModal(false);
      setEditingId(null);
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        direccion: '',
        descuento: '10%'
      });
      cargarClientes();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este cliente y todos sus hijos?')) {
      const { error } = await supabase
        .from('clientes_cumpleanos')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error: ' + error.message);
      } else {
        cargarClientes();
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setFormData({
      nombre: cliente.nombre,
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      fecha_nacimiento: cliente.fecha_nacimiento,
      direccion: cliente.direccion || '',
      descuento: cliente.descuento || '10%'
    });
    setShowModal(true);
  };

  const agregarHijo = async () => {
    if (!hijoForm.nombre || !hijoForm.fecha_nacimiento) {
      alert('Completa el nombre y fecha del hijo');
      return;
    }

    const { error } = await supabase
      .from('hijos_cumpleanos')
      .insert([{
        cliente_id: selectedCliente.id,
        nombre: hijoForm.nombre,
        fecha_nacimiento: hijoForm.fecha_nacimiento
      }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setHijoForm({ nombre: '', fecha_nacimiento: '' });
      setShowHijosModal(false);
      cargarClientes();
      alert('Hijo agregado correctamente');
    }
  };

  const eliminarHijo = async (hijoId) => {
    if (confirm('¿Eliminar este hijo?')) {
      const { error } = await supabase
        .from('hijos_cumpleanos')
        .delete()
        .eq('id', hijoId);
      
      if (!error) {
        cargarClientes();
      }
    }
  };

  const enviarMensajeCumpleanos = async (cliente, esHijo = false, hijoNombre = null) => {
    const token = config?.whatsapp_token;
    const phoneId = config?.whatsapp_phone_id;
    
    if (!token || !phoneId) {
      alert('Configura tu token de WhatsApp en la sección de Configuración');
      return;
    }

    setEnviandoMensaje(true);
    
    const nombrePersona = esHijo ? hijoNombre : cliente.nombre;
    const descuento = cliente.descuento || '10%';
    const restauranteNombre = config?.restaurante_nombre || 'PizzaCRM';
    
    const mensaje = `🎉 ¡Feliz Cumpleaños ${nombrePersona}! 🎂\n\n` +
      `${restauranteNombre} te desea un día especial.\n\n` +
      `🎁 *DESCUENTO ESPECIAL:* ${descuento} en toda tu orden\n` +
      `📅 Válido por 3 días a partir de hoy\n\n` +
      `🍕 ¡Te esperamos para celebrar! 🎈\n\n` +
      `Presenta este mensaje al llegar.`;

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cliente.telefono,
          type: "text",
          text: { preview_url: false, body: mensaje }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al enviar');
      }

      // Guardar en la base de datos de mensajes
      await supabase
        .from('mensajes_whatsapp')
        .insert([{
          cliente_nombre: nombrePersona,
          cliente_telefono: cliente.telefono,
          mensaje: mensaje,
          tipo: 'saliente',
          estado: 'enviado'
        }]);

      // Marcar notificación como enviada si es el cliente principal
      if (!esHijo) {
        await supabase
          .from('clientes_cumpleanos')
          .update({ notificacion_enviada: true })
          .eq('id', cliente.id);
      }

      alert(`🎉 Mensaje de cumpleaños enviado a ${nombrePersona}!`);

    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar mensaje. Verifica tu token de WhatsApp.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const getCumpleanosDelMes = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    
    return clientes.filter(cliente => {
      if (!cliente.fecha_nacimiento) return false;
      const fechaCumple = new Date(cliente.fecha_nacimiento);
      return fechaCumple.getMonth() === mesActual;
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const cumpleanosDelMes = getCumpleanosDelMes();
  const colorPrimario = config?.color_primario || '#dc2626';

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cake size={32} color={colorPrimario} />
            Cumpleaños
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gestiona los cumpleaños de tus clientes y sus hijos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              nombre: '',
              telefono: '',
              email: '',
              fecha_nacimiento: '',
              direccion: '',
              descuento: '10%'
            });
            setShowModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: colorPrimario,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colorPrimario}
        >
          <Plus size={20} />
          Agregar Cliente
        </button>
      </div>

      {/* Tarjeta de cumpleaños del mes */}
      {cumpleanosDelMes.length > 0 && (
        <div style={{
          backgroundColor: `${colorPrimario}15`,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${colorPrimario}30`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Gift size={24} color={colorPrimario} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Cumpleaños de este mes
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {cumpleanosDelMes.map(cliente => (
              <div key={cliente.id} style={{
                backgroundColor: 'var(--bg-card)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${colorPrimario}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🎂</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{cliente.nombre}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatearFecha(cliente.fecha_nacimiento)}</span>
                {!cliente.notificacion_enviada && (
                  <button
                    onClick={() => enviarMensajeCumpleanos(cliente)}
                    disabled={enviandoMensaje}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: colorPrimario,
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MessageCircle size={12} />
                    Enviar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `3px solid var(--border-color)`,
            borderTopColor: colorPrimario,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Cargando clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: `2px dashed var(--border-color)`
        }}>
          <span style={{ fontSize: '48px' }}>🎂</span>
          <h3 style={{ marginTop: '16px', color: 'var(--text-primary)' }}>No hay clientes registrados</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Agrega tu primer cliente para gestionar sus cumpleaños</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px'
        }}>
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '20px',
                border: `1px solid var(--border-color)`,
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                padding: '20px',
                borderBottom: `1px solid var(--border-color)`,
                background: `linear-gradient(135deg, ${colorPrimario}10 0%, transparent 100%)`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cliente.nombre}
                      {calcularEdad(cliente.fecha_nacimiento) >= 18 ? '👨' : '👶'}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {formatearFecha(cliente.fecha_nacimiento)} - {calcularEdad(cliente.fecha_nacimiento)} años
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(cliente)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'var(--hover-bg)',
                        border: `1px solid var(--border-color)`,
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Editar"
                    >
                      <Edit2 size={16} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {cliente.telefono && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Phone size={14} /> {cliente.telefono}
                    </div>
                  )}
                  {cliente.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Mail size={14} /> {cliente.email}
                    </div>
                  )}
                </div>
                
                {cliente.direccion && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    📍 {cliente.direccion}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: `${colorPrimario}15`,
                    color: colorPrimario,
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Star size={12} /> Descuento: {cliente.descuento || '10%'}
                  </span>
                  
                  <button
                    onClick={() => enviarMensajeCumpleanos(cliente)}
                    disabled={enviandoMensaje}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: cliente.notificacion_enviada ? '#10b981' : colorPrimario,
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: cliente.notificacion_enviada ? 0.7 : 1
                    }}
                    title={cliente.notificacion_enviada ? 'Mensaje ya enviado este año' : 'Enviar mensaje de cumpleaños'}
                  >
                    <Send size={12} />
                    {cliente.notificacion_enviada ? 'Enviado' : 'Enviar mensaje'}
                  </button>
                </div>
              </div>

              {/* Hijos */}
              {cliente.hijos && cliente.hijos.length > 0 && (
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--hover-bg)',
                  borderTop: `1px solid var(--border-color)`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Baby size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Hijos</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cliente.hijos.map((hijo) => (
                      <div key={hijo.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '10px',
                        border: `1px solid var(--border-color)`
                      }}>
                        <div>
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{hijo.nombre}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                            🎂 {formatearFecha(hijo.fecha_nacimiento)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => enviarMensajeCumpleanos(cliente, true, hijo.nombre)}
                            disabled={enviandoMensaje}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: colorPrimario,
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MessageCircle size={10} />
                            Enviar
                          </button>
                          <button
                            onClick={() => eliminarHijo(hijo.id)}
                            style={{
                              padding: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9ca3af'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón agregar hijo */}
              <div style={{
                padding: '12px 20px',
                borderTop: `1px solid var(--border-color)`,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setSelectedCliente(cliente);
                    setHijoForm({ nombre: '', fecha_nacimiento: '' });
                    setShowHijosModal(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: `1px dashed var(--border-color)`,
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colorPrimario}10`;
                    e.currentTarget.style.borderColor = colorPrimario;
                    e.currentTarget.style.color = colorPrimario;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Plus size={14} />
                  Agregar hijo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de agregar/editar cliente */}
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
            backgroundColor: 'var(--bg-card)',
            borderRadius: '24px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid var(--border-color)`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Fecha de nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Descuento especial
                  </label>
                  <select
                    value={formData.descuento}
                    onChange={(e) => setFormData({...formData, descuento: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="10%">10% de descuento</option>
                    <option value="15%">15% de descuento</option>
                    <option value="20%">20% de descuento</option>
                    <option value="25%">25% de descuento</option>
                    <option value="Postre gratis">Postre gratis</option>
                    <option value="Bebida gratis">Bebida gratis</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Dirección
                </label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--hover-bg)',
                    color: 'var(--text-primary)',
                    border: `1px solid var(--border-color)`,
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
                    backgroundColor: colorPrimario,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Agregar Cliente')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de agregar hijo */}
      {showHijosModal && selectedCliente && (
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
            backgroundColor: 'var(--bg-card)',
            borderRadius: '24px',
            maxWidth: '450px',
            width: '100%'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid var(--border-color)`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Baby size={20} />
                Agregar hijo de {selectedCliente.nombre}
              </h2>
              <button
                onClick={() => setShowHijosModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Nombre del hijo *
                </label>
                <input
                  type="text"
                  value={hijoForm.nombre}
                  onChange={(e) => setHijoForm({...hijoForm, nombre: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Fecha de nacimiento *
                </label>
                <input
                  type="date"
                  value={hijoForm.fecha_nacimiento}
                  onChange={(e) => setHijoForm({...hijoForm, fecha_nacimiento: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowHijosModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--hover-bg)',
                    color: 'var(--text-primary)',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarHijo}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: colorPrimario,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Agregar Hijo
                </button>
              </div>
            </div>
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
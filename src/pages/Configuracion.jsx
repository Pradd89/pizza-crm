import { useState, useEffect } from 'react';
import { useConfiguracion } from '../context/ConfiguracionContext';
import { 
  Save, 
  User, 
  Palette, 
  CheckCircle,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';

export default function Configuracion() {
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { config, guardarConfiguracion } = useConfiguracion();
  
  const [formData, setFormData] = useState({
    restaurante_nombre: 'PizzaCRM',
    restaurante_telefono: '+51 987 654 321',
    restaurante_email: 'info@pizzacrm.com',
    restaurante_direccion: 'Av. Principal 123',
    horario_apertura: '12:00',
    horario_cierre: '23:00',
    tema: 'claro',
    color_primario: '#dc2626',
  });

  useEffect(() => {
    if (config) {
      setFormData({
        restaurante_nombre: config.restaurante_nombre || 'PizzaCRM',
        restaurante_telefono: config.restaurante_telefono || '+51 987 654 321',
        restaurante_email: config.restaurante_email || 'info@pizzacrm.com',
        restaurante_direccion: config.restaurante_direccion || 'Av. Principal 123',
        horario_apertura: config.horario_apertura || '12:00',
        horario_cierre: config.horario_cierre || '23:00',
        tema: config.tema || 'claro',
        color_primario: config.color_primario || '#dc2626',
      });
    }
  }, [config]);

  const handleGuardar = async () => {
    setLoading(true);
    const success = await guardarConfiguracion(formData);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Error al guardar la configuración');
    }
    setLoading(false);
  };

  const secciones = [
    { id: 'general', nombre: 'General', icon: <User size={18} /> },
    { id: 'apariencia', nombre: 'Apariencia', icon: <Palette size={18} /> },
  ];

  const colorPrimario = formData.color_primario || '#dc2626';

  return (
    <div style={{ 
      padding: '24px', 
      height: '100%', 
      overflowY: 'auto',
      backgroundColor: 'var(--bg-page)',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          Configuración
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Personaliza tu pizzería
        </p>
      </div>

      {saved && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '32px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle size={18} />
          Configuración guardada correctamente
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{
          width: '260px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: `1px solid var(--border-color)`,
          overflow: 'hidden',
          alignSelf: 'flex-start',
          position: 'sticky',
          top: '24px'
        }}>
          <div style={{ padding: '20px', borderBottom: `1px solid var(--border-color)` }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Menú
            </h3>
          </div>
          <div style={{ padding: '8px' }}>
            {secciones.map((seccion) => (
              <button
                key={seccion.id}
                onClick={() => setActiveSection(seccion.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: activeSection === seccion.id ? `${colorPrimario}20` : 'transparent',
                  color: activeSection === seccion.id ? colorPrimario : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: activeSection === seccion.id ? '600' : '500'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== seccion.id) {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== seccion.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {seccion.icon}
                {seccion.nombre}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px',
            border: `1px solid var(--border-color)`,
            overflow: 'hidden'
          }}>
            {activeSection === 'general' && (
              <div>
                <div style={{ padding: '24px', borderBottom: `1px solid var(--border-color)`, backgroundColor: 'var(--bg-card)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Configuración General
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Información básica de tu pizzería
                  </p>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Nombre del Restaurante
                    </label>
                    <input
                      type="text"
                      value={formData.restaurante_nombre}
                      onChange={(e) => setFormData({...formData, restaurante_nombre: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid var(--border-color)`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={formData.restaurante_telefono}
                        onChange={(e) => setFormData({...formData, restaurante_telefono: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `1px solid var(--border-color)`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.restaurante_email}
                        onChange={(e) => setFormData({...formData, restaurante_email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
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

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.restaurante_direccion}
                      onChange={(e) => setFormData({...formData, restaurante_direccion: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid var(--border-color)`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Horario Apertura
                      </label>
                      <input
                        type="time"
                        value={formData.horario_apertura}
                        onChange={(e) => setFormData({...formData, horario_apertura: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `1px solid var(--border-color)`,
                          borderRadius: '12px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Horario Cierre
                      </label>
                      <input
                        type="time"
                        value={formData.horario_cierre}
                        onChange={(e) => setFormData({...formData, horario_cierre: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
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
                </div>
              </div>
            )}

            {activeSection === 'apariencia' && (
              <div>
                <div style={{ padding: '24px', borderBottom: `1px solid var(--border-color)` }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Apariencia
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Personaliza los colores y el tema de la aplicación
                  </p>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                      Tema
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, tema: 'claro'})}
                        style={{
                          flex: 1,
                          padding: '14px',
                          backgroundColor: formData.tema === 'claro' ? `${colorPrimario}20` : 'var(--bg-card)',
                          border: formData.tema === 'claro' ? `2px solid ${colorPrimario}` : `1px solid var(--border-color)`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: formData.tema === 'claro' ? '600' : '400',
                          color: formData.tema === 'claro' ? colorPrimario : 'var(--text-primary)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Sun size={18} />
                        Modo Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, tema: 'oscuro'})}
                        style={{
                          flex: 1,
                          padding: '14px',
                          backgroundColor: formData.tema === 'oscuro' ? `${colorPrimario}20` : 'var(--bg-card)',
                          border: formData.tema === 'oscuro' ? `2px solid ${colorPrimario}` : `1px solid var(--border-color)`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: formData.tema === 'oscuro' ? '600' : '400',
                          color: formData.tema === 'oscuro' ? colorPrimario : 'var(--text-primary)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Moon size={18} />
                        Modo Oscuro
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                      Color Principal
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <input
                        type="color"
                        value={formData.color_primario}
                        onChange={(e) => setFormData({...formData, color_primario: e.target.value})}
                        style={{
                          width: '60px',
                          height: '52px',
                          border: `2px solid var(--border-color)`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          backgroundColor: 'var(--bg-card)'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          Color que se usará en botones y elementos destacados
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '16px', 
                      backgroundColor: 'var(--hover-bg)', 
                      borderRadius: '12px',
                      border: `1px solid var(--border-color)`
                    }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Vista previa:</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button style={{
                          padding: '8px 16px',
                          backgroundColor: colorPrimario,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          cursor: 'default'
                        }}>
                          Botón primario
                        </button>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: `${colorPrimario}20`,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colorPrimario
                        }}>
                          A
                        </div>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: colorPrimario,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          B
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    backgroundColor: 'var(--bg-card)', 
                    borderRadius: '12px',
                    border: `1px solid var(--border-color)`
                  }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Vista previa del tema {formData.tema === 'claro' ? 'claro' : 'oscuro'}:</p>
                    <div style={{ 
                      backgroundColor: 'var(--bg-page)', 
                      padding: '16px', 
                      borderRadius: '12px',
                      border: `1px solid var(--border-color)`
                    }}>
                      <p style={{ color: 'var(--text-primary)' }}>Texto principal</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Texto secundario</p>
                      <div style={{ 
                        backgroundColor: 'var(--bg-card)', 
                        padding: '12px', 
                        borderRadius: '8px',
                        border: `1px solid var(--border-color)`,
                        marginTop: '8px'
                      }}>
                        <span style={{ color: 'var(--text-primary)' }}>Card de ejemplo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              padding: '20px 24px',
              borderTop: `1px solid var(--border-color)`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: 'var(--hover-bg)'
            }}>
              <button
                onClick={handleGuardar}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  backgroundColor: colorPrimario,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = colorPrimario;
                }}
              >
                {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      padding: '16px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px'
          }}>
            🍕🙉
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'white',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            Pizza Monkys
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '8px 0 0 0'
          }}>
            Ingresa para gestionar tu pizzería
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input 
                type="email" 
                value={email}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="admin@pizzeria.com"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Contraseña
              </label>
              <input 
                type="password" 
                value={password}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
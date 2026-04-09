import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send } from 'lucide-react'; // Importamos el icono de enviar

export default function Whatsapp() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const mensajesEndRef = useRef(null);

  // 👇 PEGA TU TOKEN LARGO DE META AQUÍ ADENTRO DE LAS COMILLAS 👇
  const META_TOKEN = 'EAANpHFjJwa8BRHyg7MIJKFCxxTo6uwvIJVg6iMIDAf55qpIS5OhPdJ1iVXuKJkt822XNFxjaPT69KjVsJf7uN07xHuieZAZCyQwI5XS1qX1N1jGugp3fpqkSsVlZAYOPuXIpZAI5HQRxhnyZB05VN3ptRsn3mpGEdHgYB9L8zJxPN9pDItQR74ZBIGinw7TXcJ5wZDZD'; 
  const PHONE_NUMBER_ID = '10283229370346141019002074637724'; // Este es tu ID exacto

  useEffect(() => {
    cargarMensajes();

    const canalSuscripcion = supabase
      .channel('mensajes-nuevos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_whatsapp' },
        (payload) => {
          setMensajes((mensajesAnteriores) => [...mensajesAnteriores, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalSuscripcion);
    };
  }, []);

  // Auto-scroll hacia abajo cuando llega o enviamos un mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const cargarMensajes = async () => {
    try {
      const { data, error } = await supabase
        .from('mensajes_whatsapp')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMensajes(data || []);
    } catch (error) {
      console.error('Error cargando los mensajes:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;

    // Buscamos el número del último cliente que nos escribió para responderle a él
    const ultimoMensajeCliente = [...mensajes].reverse().find(m => m.tipo === 'entrante');
    const numeroDestino = ultimoMensajeCliente ? ultimoMensajeCliente.cliente_telefono : null;

    if (!numeroDestino) {
      alert("No hay ningún cliente al que responderle aún.");
      return;
    }

    setEnviando(true);

    try {
      // 1. Enviar el mensaje a través de la API de Meta
      const metaResponse = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: numeroDestino,
          type: "text",
          text: { preview_url: false, body: nuevoMensaje }
        })
      });

      if (!metaResponse.ok) {
        const errorData = await metaResponse.json();
        throw new Error(errorData.error.message || 'Error al enviar por Meta');
      }

      // 2. Si Meta lo envió con éxito, lo guardamos en nuestra base de datos (Supabase)
      const { error: supabaseError } = await supabase
        .from('mensajes_whatsapp')
        .insert([{
          cliente_nombre: 'PizzaCRM',
          cliente_telefono: numeroDestino,
          mensaje: nuevoMensaje,
          tipo: 'saliente',
          estado: 'enviado'
        }]);

      if (supabaseError) throw supabaseError;

      // Limpiamos la caja de texto
      setNuevoMensaje('');

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Hubo un error al enviar el mensaje. Revisa la consola o verifica si tu Token expiró.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280' }}>
        Cargando chat... chill, man 🌴
      </div>
    );
  }

  // Buscamos a quién le estamos respondiendo para mostrarlo en la interfaz
  const ultimoMensajeCliente = [...mensajes].reverse().find(m => m.tipo === 'entrante');
  const respondiendoA = ultimoMensajeCliente ? ultimoMensajeCliente.cliente_nombre : 'Nadie aún';

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        
        {/* Cabecera del chat */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
            Bandeja de WhatsApp
          </h2>
          <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#e5e7eb', padding: '4px 10px', borderRadius: '12px' }}>
            Chat actual: {respondiendoA}
          </span>
        </div>

        {/* Área de mensajes (Burbujas) */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#f3f4f6'
        }}>
          {mensajes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', margin: 'auto' }}>
              No hay mensajes todavía.
            </p>
          ) : (
            mensajes.map((msg) => {
              const esEntrante = msg.tipo === 'entrante';
              return (
                <div 
                  key={msg.id} 
                  style={{
                    alignSelf: esEntrante ? 'flex-start' : 'flex-end',
                    backgroundColor: esEntrante ? 'white' : '#dc2626',
                    color: esEntrante ? '#111827' : 'white',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: esEntrante ? '1px solid #e5e7eb' : 'none',
                    maxWidth: '70%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    borderBottomLeftRadius: esEntrante ? '4px' : '16px',
                    borderBottomRightRadius: !esEntrante ? '4px' : '16px'
                  }}
                >
                  {esEntrante && (
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', marginBottom: '4px' }}>
                      {msg.cliente_nombre}
                    </div>
                  )}
                  <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {msg.mensaje}
                  </div>
                </div>
              );
            })
          )}
          <div ref={mensajesEndRef} />
        </div>

        {/* BARRA PARA ESCRIBIR EL MENSAJE */}
        <form 
          onSubmit={enviarMensaje}
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
            display: 'flex',
            gap: '12px'
          }}
        >
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            disabled={enviando || !ultimoMensajeCliente}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: enviando ? '#f9fafb' : 'white'
            }}
          />
          <button
            type="submit"
            disabled={enviando || !nuevoMensaje.trim() || !ultimoMensajeCliente}
            style={{
              backgroundColor: (!nuevoMensaje.trim() || enviando) ? '#fca5a5' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!nuevoMensaje.trim() || enviando) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
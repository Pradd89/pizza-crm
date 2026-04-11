import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ConfiguracionContext = createContext();

export function ConfiguracionProvider({ children }) {
  const [config, setConfig] = useState({
    restaurante_nombre: 'PizzaCRM',
    restaurante_telefono: '+51 987 654 321',
    restaurante_email: 'info@pizzacrm.com',
    restaurante_direccion: 'Av. Principal 123',
    horario_apertura: '12:00',
    horario_cierre: '23:00',
    tema: 'claro',
    color_primario: '#dc2626',
  });
  
  const [loading, setLoading] = useState(true);

  const aplicarTema = useCallback((tema, colorPrimario) => {
    if (tema === 'oscuro') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    document.documentElement.style.setProperty('--color-primary', colorPrimario);
  }, []);

  const cargarConfiguracion = useCallback(async () => {
    // Cargar de localStorage
    const localConfig = localStorage.getItem('app_config');
    if (localConfig) {
      const parsed = JSON.parse(localConfig);
      setConfig(parsed);
      aplicarTema(parsed.tema, parsed.color_primario);
    } else {
      aplicarTema('claro', '#dc2626');
    }
    setLoading(false);
  }, [aplicarTema]);

  const guardarConfiguracion = useCallback(async (nuevaConfig) => {
    // Guardar en localStorage
    localStorage.setItem('app_config', JSON.stringify(nuevaConfig));
    setConfig(nuevaConfig);
    aplicarTema(nuevaConfig.tema, nuevaConfig.color_primario);
    return true;
  }, [aplicarTema]);

  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  return (
    <ConfiguracionContext.Provider value={{ 
      config, 
      setConfig, 
      guardarConfiguracion, 
      cargarConfiguracion,
      loading 
    }}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracion() {
  return useContext(ConfiguracionContext);
}
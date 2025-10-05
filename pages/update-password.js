// pages/update-password.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  // Asegurarse de que Supabase haya procesado el token de la URL antes de mostrar el formulario
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setMessage('Ingresa tu nueva contraseña a continuación.');
      } else {
        setMessage('Acceso no autorizado. Por favor, usa el enlace de tu email.');
      }
    });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) return;

    try {
      setLoading(true);
      // Actualiza la contraseña para el usuario actualmente autenticado (por el token)
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('¡Contraseña actualizada con éxito! Redirigiendo a tu dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Actualizar Contraseña</h2>
      <p>{message}</p>
      {/* Solo mostramos el formulario si hay un mensaje que lo sugiere */}
      {message.includes('Ingresa') && (
        <form className="auth-form" onSubmit={handleUpdatePassword}>
          <input
            type="password"
            placeholder="Nueva Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Guardar Nueva Contraseña'}
          </button>
        </form>
      )}
    </div>
  );
}

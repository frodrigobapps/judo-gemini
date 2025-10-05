// pages/update-password.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  // Escucha el cambio de estado de autenticación (debe estar activado por el token en la URL)
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setMessage('Ingresa tu nueva contraseña a continuación.');
      } else {
        setMessage('Error de token. Por favor, usa el enlace de tu email.');
      }
    });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('¡Contraseña actualizada con éxito! Redirigiendo a tu dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      setMessage(`Error al actualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Actualizar Contraseña</h2>
      <p>{message}</p>
      
      {/* Solo mostramos el formulario si el token es válido */}
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
            {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
          </button>
        </form>
      )}
    </div>
  );
}

// components/Auth.js (MODIFICADO)
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Nuevo estado

  const handleLogin = async (e) => {
    // ... (Tu código de handleLogin anterior)
  };

  const handleSignUp = async (e) => {
    // ... (Tu código de handleSignUp anterior)
  };

  // NUEVA FUNCIÓN: Manejar el envío de restablecimiento de contraseña
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Debes especificar la URL a la que el usuario será redirigido
        // para cambiar su contraseña. Crearemos esta página en el siguiente paso.
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      alert('¡Enlace enviado! Revisa tu correo electrónico para restablecer tu contraseña.');
      setIsForgotPassword(false);
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Condicional para mostrar el formulario de restablecimiento
  if (isForgotPassword) {
    return (
      <div className="auth-container">
        <h2>Restablecer Contraseña</h2>
        <form className="auth-form" onSubmit={handlePasswordReset}>
          <input
            type="email"
            placeholder="Tu email registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Enlace'}
          </button>
        </form>
        <button className="text-link" onClick={() => setIsForgotPassword(false)}>
          Volver al Login
        </button>
      </div>
    );
  }

  // Formulario principal (Login/Registro)
  return (
    <div className="auth-container">
      <h1>Academia de Judo</h1>
      <p>Inicia sesión o crea una cuenta</p>
      <form>
        {/* ... Campos de email y password anteriores ... */}
        {/* Usar handleSubmit para manejar el submit del formulario */}
        <div className="auth-buttons">
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </div>
      </form>
      {/* Botón para ir al formulario de olvido de contraseña */}
      <button className="text-link" onClick={() => setIsForgotPassword(true)}>
        ¿Olvidaste tu Contraseña?
      </button>
    </div>
  );
}

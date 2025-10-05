// components/Auth.js
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Crucial para detener el refresh del formulario
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Redirección manejada por el hook de Next.js
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('¡Registro exitoso! Revisa tu email para confirmar y luego inicia sesión.');
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

  return (
    <div className="auth-container">
      <h1>Academia de Judo</h1>
      <p>Inicia sesión o crea una cuenta</p>
      
      {/* Formulario principal, gestionado por handleLogin */}
      <form onSubmit={handleLogin} className="auth-form"> 
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="auth-buttons">
          {/* Botón de Submit */}
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          
          {/* Botón de Registro (type="button" para no enviar el formulario) */}
          <button type="button" onClick={handleSignUp} disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </div>
      </form>
      
      <button className="text-link" onClick={() => setIsForgotPassword(true)}>
        ¿Olvidaste tu Contraseña?
      </button>
    </div>
  );
}

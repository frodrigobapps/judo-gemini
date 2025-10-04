// components/Auth.js
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // El refresco de página será manejado por el hook de sesión en index.js
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
        setLoading(true)
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('¡Registro exitoso! Revisa tu email para activar tu cuenta.')
    } catch (error) {
        alert(error.error_description || error.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h1>Academia de Judo</h1>
      <p>Inicia sesión o crea una cuenta para acceder al contenido</p>
      <form className="auth-form">
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-buttons">
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  )
}

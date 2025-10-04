// pages/index.js
import { useSession, useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import Auth from '../components/Auth'
import { supabase } from '../lib/supabase'

export default function Home() {
  const session = useSession()
  const user = useUser()

  return (
    <div className="container">
      {!session ? (
        <Auth />
      ) : (
        <div className="welcome-container">
          <h2>¡Bienvenido de nuevo, {user.email}!</h2>
          <Link href="/dashboard">
            <button className="primary-button">Ir al Dashboard de Contenido</button>
          </Link>
          <button className="secondary-button" onClick={() => supabase.auth.signOut()}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}

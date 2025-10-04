// pages/dashboard.js
import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import AdminPanel from '../components/AdminPanel'

export default function Dashboard() {
  const user = useUser()
  const router = useRouter()
  const [content, setContent] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setLoading(true)

        // 1. Obtener el perfil del usuario para saber su rol
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else {
          setProfile(profileData)
        }

        // 2. Obtener el contenido (RLS se encarga de filtrar)
        const { data: contentData, error: contentError } = await supabase.from('content').select('*').order('created_at', { ascending: false });

        if (contentError) {
          console.error('Error fetching content:', contentError)
        } else {
          setContent(contentData)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Función para refrescar el contenido después de que el admin suba algo nuevo
  const refreshContent = async () => {
     const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
     if (data) setContent(data);
  }

  if (loading) return <div className="container">Cargando...</div>
  if (!user) return null; // El middleware ya se encarga de redirigir

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>Dashboard de Contenido</h1>
        <p>Bienvenido, {user.email}</p>
        <button className="secondary-button" onClick={() => supabase.auth.signOut()}>Cerrar Sesión</button>
      </header>

      {/* El panel de admin solo se muestra si el rol es 'admin' */}
      {profile && profile.role === 'admin' && (
        <AdminPanel onContentUploaded={refreshContent} />
      )}

      <div className="content-grid">
        {content.length > 0 ? (
          content.map((item) => (
            <div key={item.id} className="content-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.file_url && <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="primary-button">Ver Material</a>}
            </div>
          ))
        ) : (
          <p>Aún no hay contenido disponible.</p>
        )}
      </div>
    </div>
  )
}

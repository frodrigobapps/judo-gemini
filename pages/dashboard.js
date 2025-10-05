// pages/dashboard.js (MODIFICADO)
import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import AdminPanel from '../components/AdminPanel';

export default function Dashboard() {
    const user = useUser();
    const router = useRouter();
    const [content, setContent] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshContent = async () => {
        // Obtenemos TODO el contenido si es admin, o solo el publicado si es suscriptor
        const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
        if (data) setContent(data);
    };

    useEffect(() => {
        async function fetchData() {
            if (user) {
                setLoading(true);

                // 1. Obtener el perfil del usuario para saber su rol
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                setProfile(profileData);
                await refreshContent(); // Cargar contenido
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    if (loading) return <div className="container">Cargando...</div>;
    if (!user) return null; // El middleware ya se encarga de redirigir

    return (
        <div className="container">
            <header className="dashboard-header">
                <h1>Dashboard de Contenido</h1>
                <p>Bienvenido, {user.email}</p>
            </header>

            {/* Panel de Admin (Ahora necesita más props) */}
            {profile && profile.role === 'admin' && (
                <AdminPanel 
                    content={content} 
                    refreshContent={refreshContent} 
                    onContentUploaded={refreshContent} 
                />
            )}
            
            {/* Listado de Contenido para SUSCRIPTORES */}
            <div className="content-grid">
                {/* ... (El código anterior para mostrar las tarjetas de contenido) ... */}
                {/* La única diferencia es que ahora 'content' puede incluir contenido no publicado si eres admin */}
                {content.length > 0 ? (
                    content.map((item) => (
                        <div key={item.id} className="content-card">
                            <h3>{item.title} {item.is_published ? '' : '(BORRADOR)'}</h3>
                            <p>{item.description}</p>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="primary-button">Ver Material</a>
                            {/* ¡Aviso! El enlace 'Ver Material' debe usar getSignedUrl para archivos privados de Storage */}
                            {/* **Recuerda cambiar la URL del archivo para usar un getSignedUrl en producción.** */}
                        </div>
                    ))
                ) : (
                    <p>Aún no hay contenido disponible.</p>
                )}
            </div>
        </div>
    );
}

// pages/dashboard.js
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

    const fetchSignedUrl = async (path) => {
        if (!path) return '#';
        // Genera una URL firmada válida por 60 segundos para acceder al archivo privado
        const { data } = await supabase.storage.from('private_content').createSignedUrl(path, 60);
        return data?.signedUrl || '#';
    };

    const refreshContent = async () => {
        const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching content:', error);
            return;
        }

        // Para cada elemento, obtenemos la URL firmada
        const contentWithUrls = await Promise.all(
            data.map(async (item) => ({
                ...item,
                // Usamos el file_url guardado (que es solo la ruta) para obtener la URL firmada
                signed_url: await fetchSignedUrl(item.file_url),
            }))
        );
        
        setContent(contentWithUrls);
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
        
        // Refrescar las URLs firmadas cada 50 segundos para mantener el acceso
        const interval = setInterval(() => {
            if (user) refreshContent();
        }, 50000);
        
        return () => clearInterval(interval); // Limpiar al salir

    }, [user]);

    if (loading) return <div className="container">Cargando...</div>;
    if (!user) return null;

    return (
        <div className="container">
            <header className="dashboard-header">
                <h1>Dashboard de Contenido</h1>
                <p>Bienvenido, {user.email}</p>
            </header>

            {/* Panel de Admin */}
            {profile && profile.role === 'admin' && (
                <AdminPanel 
                    content={content} 
                    refreshContent={refreshContent} 
                    onContentUploaded={refreshContent} 
                />
            )}
            
            {/* Listado de Contenido para Suscriptores */}
            <div className="content-grid">
                {content.length > 0 ? (
                    content.map((item) => (
                        <div key={item.id} className="content-card">
                            <h3>{item.title} {profile.role === 'admin' && !item.is_published && '(BORRADOR)'}</h3>
                            <p>{item.description}</p>
                            {/* Usamos signed_url que se calculó en refreshContent */}
                            {item.signed_url && <a href={item.signed_url} target="_blank" rel="noopener noreferrer" className="primary-button">Ver Material</a>}
                        </div>
                    ))
                ) : (
                    <p>Aún no hay contenido disponible.</p>
                )}
            </div>
        </div>
    );
}

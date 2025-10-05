// components/Layout.js
import Link from 'next/link';
import { useSession, useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';

const Layout = ({ children }) => {
  const session = useSession();
  const user = useUser();

  return (
    <div>
      <nav className="navbar">
        <div className="logo"><Link href="/">Academia de Judo</Link></div>
        <div className="nav-links">
          <Link href="/clases">Clases y Horarios</Link>
          <Link href="/sobre-nosotros">Sobre Nosotros</Link>
          <Link href="/contacto">Contacto</Link>
          
          {session ? (
            // Enlaces para usuarios logueados
            <>
              <Link href="/dashboard" className="nav-button">Dashboard</Link>
              <button onClick={() => supabase.auth.signOut()} className="logout-button">Salir</button>
            </>
          ) : (
            // Enlace para usuarios no logueados
            <Link href="/" className="nav-button">Acceso Miembros</Link>
          )}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;

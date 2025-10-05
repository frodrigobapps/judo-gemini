// pages/index.js
import { useSession } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import Auth from '../components/Auth';

export default function Home() {
  const session = useSession();

  return (
    <div className="container">
      {!session ? (
        <Auth />
      ) : (
        <div className="welcome-container">
          <h2>¡Bienvenido!</h2>
          <p>Ya puedes acceder al contenido exclusivo.</p>
          <Link href="/dashboard">
            <button className="primary-button">Ir al Dashboard</button>
          </Link>
        </div>
      )}
    </div>
  );
}

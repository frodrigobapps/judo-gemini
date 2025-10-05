// pages/_app.js (MODIFICADO)
import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Layout from '../components/Layout'; // Importar el Layout
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      {/* Envolver el componente con el Layout */}
      <Layout> 
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  );
}
export default MyApp;

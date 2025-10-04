// lib/supabase.js
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// Crea un cliente de Supabase para el lado del cliente (navegador)
export const supabase = createPagesBrowserClient()

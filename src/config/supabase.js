/**
 * Supabase Configuration
 * 
 * This file exports the Supabase client instance.
 * Connected to real Supabase authentication.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * JWT Structure from Supabase:
 * 
 * {
 *   sub: "uuid",
 *   email: "user@example.com",
 *   role: "authenticated",
 *   app_metadata: {
 *     provider: "email",
 *     role: "admin" // Custom role set in Supabase
 *   }
 * }
 * 
 * Note: The 'role' field is at the root of JWT payload (Supabase default),
 * while custom roles should be stored in app_metadata.role
 */

/**
 * Login Page
 * 
 * Supabase Authentication - NO MOCKS
 * Real authentication with JWT tokens
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useRedirectIfAuthenticated from '../hooks/useRedirectIfAuthenticated';
import logo from '../assets/logoConFondo.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useRedirectIfAuthenticated();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        setError('Por favor, introduzca su correo electrónico.');
        setIsSubmitting(false);
        return;
      }
      
      if (!password) {
        setError('Por favor, introduzca su contraseña.');
        setIsSubmitting(false);
        return;
      }

      // Attempt login with Supabase
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <div className="w-full bg-white border-b">
        <div className="w-full px-4 py-4 flex justify-center items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <img src={logo} alt="FluxLab Logo" className="w-8 h-13 rounded-full object-cover"/>
            </div>
            <span className="text-lg font-bold">FluxLab</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
            {/* Header */}
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
              Bienvenido
            </h1>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Inicia sesión para acceder a tu cuenta de FluxLab
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>✉️</span>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🔒</span>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right pt-2">
                <a href="#forgot" className="text-sm text-emerald-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded transition mt-6 tracking-wide disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting || loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    INICIANDO SESIÓN...
                  </>
                ) : (
                  'INICIAR SESIÓN'
                )}
              </button>
            </form>
            
            {/*
            // Comentados por ahora, pero listos para ser implementados con Supabase Social Auth
            // Divider 
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O ACCEDE CON TU CUENTA</span>
              </div>
            </div>

            // Botones de Google y Microsoft
            <div className="flex gap-4 justify-center">
            <button className="flex items-center justify-center rounded-xl bg-[#1A1A1A] hover:bg-black transition-all shadow-lg w-14 h-14 group">
              <img
                src="https://www.svgrepo.com/show/448239/microsoft.svg"
                alt="Microsoft"
                className="w-8 h-8 group-hover:scale-110 transition-transform"
              />
            </button>

            <button className="flex items-center justify-center rounded-xl bg-[#1A1A1A] hover:bg-black transition-all shadow-lg w-14 h-14 group">
              <img
                src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                alt="Google"
                className="w-7 h-7 group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
          */}
          
            {/* Registration Info */}
            <p className="text-center text-gray-600 mt-8 text-sm">
              ¿No tienes una cuenta?{' '}
              <span className="text-gray-700 font-semibold">Contacta con tu administrador</span>
            </p>

            {/* Back Link */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition inline-flex items-center gap-1"
              >
                ← Volver a la página de bienvenida
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-6 px-4 text-center text-xs text-gray-500">
        <p>© 2026 FLUXLAB. DISEÑADO PARA LA PRECISIÓN CIENTÍFICA.</p>
      </div>
    </div>
  );
}

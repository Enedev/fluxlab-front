/**
 * Login Page
 * 
 * Supabase Authentication - NO MOCKS
 * Real authentication with JWT tokens
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import logo from '../assets/logoConFondo.jpeg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, updateUserPasswordChanged } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  /**
   * Handle form submission - SIMPLE FLOW
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email.trim()) {
        setError('Por favor, introduzca su correo electronico.');
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setError('Por favor, introduzca su contrasena.');
        setIsSubmitting(false);
        return;
      }

      // Use authService.signIn directly so we DON'T set global context yet
      const result = await authService.signIn(email, password);

      if (result.error) {
        setError(result.error || 'Error al iniciar sesión');
        setIsSubmitting(false);
        return;
      }

      const user = result.user;
      console.log('SignIn result user:', user);
      setCurrentUser(user);

      // If user is admin, bypass forced password change
      const isAdmin = user?.app_metadata?.role === 'admin' || user?.role === 'admin';

      if (!isAdmin && user?.passwordChanged === false) {
        // show modal and DO NOT set global auth yet
        console.log('passwordChanged false and not admin -> show modal');
        setShowPasswordChangeModal(true);
        setIsSubmitting(false);
        return;
      }

      // Otherwise finalize login in context
      const loginResult = await login(email, password);
      if (!loginResult.success) {
        setError(loginResult.error || 'Error al establecer la sesión');
        setIsSubmitting(false);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setIsChangingPassword(true);

    try {
      // Validate inputs
      if (!newPassword || !confirmPassword) {
        setPasswordError('Por favor, complete todos los campos.');
        setIsChangingPassword(false);
        return;
      }

      if (newPassword.length < 8) {
        setPasswordError('La contraseña debe tener al menos 8 caracteres.');
        setIsChangingPassword(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden.');
        setIsChangingPassword(false);
        return;
      }

      // Change password via authService
      console.log('Attempting to change password...');
      const changeResult = await authService.changePassword(newPassword);

      if (changeResult.error) {
        console.error('Password change error:', changeResult.error);
        setPasswordError(changeResult.error || 'Error al cambiar la contraseña.');
        setIsChangingPassword(false);
      } else {
        console.log('Password changed successfully!');
        // Password changed successfully - now finalize login in context with the new password
        const updatedUser = {
          ...currentUser,
          passwordChanged: true,
        };
        setCurrentUser(updatedUser);

        // Re-authenticate to set global session with the new password
        const loginResult = await login(currentUser?.email || email, newPassword);
        if (!loginResult.success) {
          setPasswordError(loginResult.error || 'Error al iniciar sesión después de cambiar la contraseña.');
          setIsChangingPassword(false);
          return;
        }

        // update context user state if needed
        updateUserPasswordChanged(loginResult.user || updatedUser);

        // Close modal and redirect to dashboard
        console.log('Closing modal and navigating to dashboard');
        setShowPasswordChangeModal(false);
        setIsChangingPassword(false);

        // Clear form
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');

        // Navigate
        setTimeout(() => navigate('/dashboard'), 100);
      }
    } catch (err) {
      setPasswordError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
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
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded transition mt-6 tracking-wide disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    INICIANDO SESIÓN...
                  </>
                ) : (
                  'INICIAR SESIÓN'
                )}
              </button>
            </form>
          
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

      {/* Password Change Modal */}
      {showPasswordChangeModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cambiar Contraseña</h2>
            <p className="text-gray-600 text-sm mb-6">
              Por tu seguridad, debes cambiar tu contraseña temporal antes de continuar.
            </p>
            
            {/* Error Message */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isChangingPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>💡 Consejo:</strong> Usa una contraseña fuerte con letras mayúsculas, minúsculas, números y caracteres especiales.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Cambiando...
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t py-6 px-4 text-center text-xs text-gray-500">
        <p>© 2026 FLUXLAB. DISEÑADO PARA LA PRECISIÓN CIENTÍFICA.</p>
      </div>
    </div>
  );
}

/**
 * Login Page
 * 
 * Supabase Authentication - NO MOCKS
 * Real authentication with JWT tokens
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  faCheck,
  faClipboard,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLightbulb,
  faLock,
  faSpinner,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Icon from '../components/Icon';
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

  const passwordValidations = {
    minLength: newPassword.length >= 8,
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[^A-Za-z0-9]/.test(newPassword),
    hasUpperAndLower: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
  };

  const passwordValidationItems = [
    {
      key: 'minLength',
      label: 'La contraseña debe tener mínimo 8 caracteres',
      isValid: passwordValidations.minLength,
      errorMessage: 'La contraseña debe tener al menos 8 caracteres.',
    },
    {
      key: 'hasNumber',
      label: 'La contraseña debe contener al menos 1 número',
      isValid: passwordValidations.hasNumber,
      errorMessage: 'La contraseña debe contener al menos 1 número.',
    },
    {
      key: 'hasSpecialChar',
      label: 'La contraseña debe contener al menos 1 carácter especial',
      isValid: passwordValidations.hasSpecialChar,
      errorMessage: 'La contraseña debe contener al menos 1 carácter especial.',
    },
    {
      key: 'hasUpperAndLower',
      label: 'La contraseña debe contener al menos 1 letra mayúscula y 1 letra minúscula',
      isValid: passwordValidations.hasUpperAndLower,
      errorMessage: 'La contraseña debe contener al menos 1 letra mayúscula y 1 letra minúscula.',
    },
  ];

  const isPasswordComplex = passwordValidationItems.every((validation) => validation.isValid);
  const passwordsMatch = newPassword !== '' && confirmPassword !== '' && newPassword === confirmPassword;
  const completedComplexityRules = passwordValidationItems.filter((validation) => validation.isValid).length;
  const totalPasswordProgressSteps = passwordValidationItems.length + 1;
  const completedPasswordProgressSteps = completedComplexityRules + (passwordsMatch ? 1 : 0);
  const passwordProgressPercent = (completedPasswordProgressSteps / totalPasswordProgressSteps) * 100;
  const isReadyForPasswordUpdate = isPasswordComplex && passwordsMatch;

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

      navigate('/projects');
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

      if (!isPasswordComplex) {
        setPasswordError('La contraseña no cumple los criterios de complejidad.');
        setIsChangingPassword(false);
        return;
      }

      if (!passwordsMatch) {
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
        setTimeout(() => navigate('/projects'), 100);
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
                  <Icon icon={faEnvelope} size={14} color="currentColor" />
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
                  <Icon icon={faLock} size={14} color="currentColor" />
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
                    {showPassword ? (
                      <Icon icon={faEyeSlash} size={14} color="currentColor" />
                    ) : (
                      <Icon icon={faEye} size={14} color="currentColor" />
                    )}
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
                className="w-full mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon={faSpinner} spin className="mr-2" size={14} color="currentColor" />
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
{/* descomentar */}
            {/* Back Link */}
            <div className="text-center mt-6">
              {/* <Link
                to="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition inline-flex items-center gap-1"
              >
                ← Volver a la página de bienvenida
              </Link> */}
              <span
                
                className="text-sm text-gray-400 hover:text-gray-600 transition inline-flex items-center gap-1"
              >
                ¡Software LIMS adaptado para ti!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChangeModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-8">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">Cambiar Contraseña</h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              Por tu seguridad, debes cambiar tu contraseña temporal antes de continuar.
            </p>
            
            {/* Error Message */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            {/* Email Display with Copy Button */}
            {/* <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu Correo Electrónico
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUser?.email || email}
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser?.email || email);
                  }}
                  className=""
                >
                  <span className="inline-flex items-center gap-1">
                    <Icon icon={faClipboard} size={14} color="currentColor" />
                    Copiar
                  </span>
                </button>
              </div>
            </div> */}

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
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) {
                        setPasswordError('');
                      }
                    }}
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isChangingPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {showNewPassword ? (
                      <Icon icon={faEyeSlash} size={14} color="currentColor" />
                    ) : (
                      <Icon icon={faEye} size={14} color="currentColor" />
                    )}
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  {passwordValidationItems.map((validation) => (
                    <li key={validation.key} className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                          validation.isValid ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      >
                        <Icon
                          icon={validation.isValid ? faCheck : faXmark}
                          size={10}
                          color="white"
                        />
                      </span>
                      <span className={`text-xs ${validation.isValid ? 'text-emerald-700' : 'text-gray-600'}`}>
                        {validation.label}
                      </span>
                    </li>
                  ))}
                </ul>
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) {
                      setPasswordError('');
                    }
                  }}
                  disabled={isChangingPassword}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Info Box */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong className="inline-flex items-center gap-1">
                    <Icon icon={faLightbulb} size={12} color="currentColor" />
                    Consejo:
                  </strong>{' '}
                  Usa una contraseña fuerte con letras mayúsculas, minúsculas, números y caracteres especiales.
                </p>
              </div> */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`w-full font-medium rounded-lg px-6 py-2 transition-all duration-200 flex items-center justify-center ${
                  isReadyForPasswordUpdate
                    ? 'bg-emerald-500! text-black! shadow-lg shadow-emerald-400/50 hover:bg-emerald-600! hover:text-white!'
                    : 'bg-gray-100! text-gray-700! border border-gray-300 hover:bg-gray-200!'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isChangingPassword ? (
                  <>
                    <Icon icon={faSpinner} spin className="mr-2" size={14} color="currentColor" />
                    Cambiando...
                  </>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Icon icon={faLock} size={14} color="currentColor" />
                    Cambiar Contraseña
                  </span>
                )}
              </button>
            </form>
            </div>

            {/* Password Progress Bar */}
            <div className="w-full h-2.5 bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                style={{ width: `${passwordProgressPercent}%` }}
              />
            </div>
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

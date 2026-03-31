import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <div className="w-full bg-white border-b">
        <div className="w-full px-4 py-4 flex justify-center items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">FL</span>
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
              Welcome Back
            </h1>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Sign in to access your FluxLab account.
            </p>

            {/* Form */}
            <form className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>✉️</span>
                  EMAIL
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🔒</span>
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right pt-2">
                <a href="#" className="text-sm text-emerald-600 hover:underline">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded transition mt-6 tracking-wide"
              >
                SIGN IN
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ENTERPRISE SIGN-IN</span>
              </div>
            </div>

            {/* SSO Button */}
            <button className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-semibold py-3 px-4 rounded transition flex items-center justify-center gap-2">
              <span>⚙️</span>
              Sign in with SAML / SSO
            </button>

            {/* Registration Info */}
            <p className="text-center text-gray-600 mt-8 text-sm">
              Don't have an account?{' '}
              <span className="text-gray-700 font-semibold">Contact your administrator</span>
            </p>

            {/* Back Link */}
            <div className="text-center mt-8">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition inline-flex items-center gap-1"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-6 px-4 text-center text-xs text-gray-500">
        <p>© 2024 FLUXLAB LABS. PRECISION ENGINEERED FOR MODERN SCIENCE.</p>
      </div>
    </div>
  );
}

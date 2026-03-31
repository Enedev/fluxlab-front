import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">FL</span>
            </div>
            <span className="text-lg font-bold">FluxLab</span>
          </div>
          <ul className="hidden md:flex gap-8 items-center">
            <li><a href="#features" className="text-gray-700 hover:text-gray-900">Features</a></li>
            <li><a href="#solutions" className="text-gray-700 hover:text-gray-900">Solutions</a></li>
            <li><a href="#pricing" className="text-gray-700 hover:text-gray-900">Pricing</a></li>
            <li><a href="#about" className="text-gray-700 hover:text-gray-900">About</a></li>
          </ul>
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link to="/login" className="bg-emerald-500 text-white px-6 py-2 rounded hover:bg-emerald-600 font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              NEW RELEASE V0.1
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              The Future of<br />
              <span className="text-emerald-500">Laboratory</span><br />
              Intelligence.
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              FluxLab empowers scientific teams with real-time analytics, automated compliance, and seamless sample tracking. Precision-engineered for modern science.
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-emerald-500 text-white px-8 py-3 rounded font-semibold hover:bg-emerald-600 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-lg p-8 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-32 h-32 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-blue-200 text-sm">LIVE SAMPLE PROCESSING</p>
              <p className="text-white font-bold text-xl mt-2">99.9% ACCURACY</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clients */}
      <section className="w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 text-sm font-semibold mb-8">TRUSTED BY GLOBAL RESEARCH LEADERS</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {['PHARMACO', 'GENEBOUND', 'BIOSEARCH', 'VACCICORP', 'NOVALAB'].map((company) => (
              <div key={company} className="text-gray-700 font-semibold text-sm">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Precision-Engineered Performance
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Advanced tools designed for the rigorous demands of modern laboratory workflows.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Smart Sample Tracking */}
            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 2C7.897 2 7 2.897 7 4v16c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H9zm.5 2h9v14h-9V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Sample Tracking</h3>
              <p className="text-gray-600 mb-4">
                Real-time visibility into the end-to-end lifecycle of every sample. From intake to disposal.
              </p>
              <div className="space-y-2">
                <div className="h-2 w-24 bg-emerald-200 rounded"></div>
                <div className="h-2 w-32 bg-emerald-300 rounded"></div>
                <div className="h-2 w-20 bg-emerald-200 rounded"></div>
              </div>
            </div>

            {/* Automated Compliance */}
            <div className="bg-slate-900 text-white p-8 rounded-lg">
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1C6.477 1 2 5.477 2 11s4.477 10 10 10 10-4.477 10-10S17.523 1 12 1zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm3.5-9c.828 0 1.5-.672 1.5-1.5S16.328 7 15.5 7 14 7.672 14 8.5s.672 1.5 1.5 1.5zm-7 0c.828 0 1.5-.672 1.5-1.5S9.328 7 8.5 7 7 7.672 7 8.5 7.672 10 8.5 10zm3.5 7c-2.33 0-4.41-1.255-5.5-3.115C7.08 12.885 9.16 12 12 12s4.92.885 5.5 1.885C16.41 15.745 14.33 17 12 17z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Compliance</h3>
              <p className="text-gray-300 mb-4">
                ISO 17025 ready documentation generated automatically for audit readiness.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Audit Trail Active
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> E-Signatures Verified
                </li>
              </ul>
            </div>

            {/* Advanced Analytics */}
            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l2.5-2.5m0 5L7 12m5 2.5L12 7m0 10l-2.5-2.5" />
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Unlock real-time workflow insights and reporting to optimize lab throughput.
              </p>
              <div className="flex gap-1 items-end justify-center">
                {[60, 70, 65, 80, 75].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-300 rounded"
                    style={{ height: `${val/2}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Secure Collaboration */}
            <div>
              <div className="mb-4">
                <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.362M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.862m-4.101-3.846a4 4 0 11-8 0 4 4 0 018 0zM15 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Collaboration</h3>
              <p className="text-gray-600 mb-4">
                Granular role-based access control for global team securely share data.
              </p>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-emerald-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
                <div className="text-xs text-gray-600 ml-2">+2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Modernize Your Research?
          </h2>
          <p className="text-emerald-50 mb-8 text-lg">
            Join over 500+ laboratories worldwide that trust FluxLab for their mission-critical management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-black text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition"
            >
              Start 14-Day Free Trial
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-white hover:text-emerald-600 transition">
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">FL</span>
                </div>
                <span className="text-white font-bold">FluxLab</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition">Security Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© 2024 FLUXLAB LABS. PRECISION ENGINEERED FOR MODERN SCIENCE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
